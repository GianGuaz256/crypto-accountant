import axios from 'axios';
import { Transaction } from './transactionFetcher';
import { findTokenByAddress, tokenReferences } from './tokenReference';

// Get API key from environment variable or use placeholder
const NEXT_PUBLIC_OPENAI_API_KEY = 
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_OPENAI_API_KEY 
    ? process.env.NEXT_PUBLIC_OPENAI_API_KEY 
    : 'YourOpenAIApiKey'; // Fallback for development

// Configuration for API retry logic
const API_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_RETRY_DELAY: 1000, // 1 second
  MAX_TRANSACTIONS_PER_BATCH: 10 // Process at most 10 transactions per batch
};

// Helper function to delay execution (for backoff)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export interface AISuggestion {
  index: number;
  label: string;
  description: string;
  reason: string;
  tokenMatch?: {
    symbol: string;
    name: string;
    type: string;
  };
}

export async function analyzeTransactions(transactions: Transaction[]): Promise<AISuggestion[]> {
  try {
    // Step 1: Enrich transactions with token matches
    const enrichedTransactions = transactions.map(tx => {
      // Check if to or from addresses match any known token contracts
      const toTokenMatch = tx.to ? findTokenByAddress(tx.to) : undefined;
      const fromTokenMatch = tx.from ? findTokenByAddress(tx.from) : undefined;
      
      // Determine if this is likely a contract interaction
      const isLikelyContractCall = 
        // Use transactionType directly if available
        tx.transactionType === 'contractCall' || tx.transactionType === 'contractCreation' ||
        // Otherwise use heuristics as fallback
        (tx.to && (
          // If we have identified this as a token contract
          toTokenMatch !== undefined ||
          // Or if the transaction has additional data (often indicates contract interaction)
          (tx.hash && tx.hash.length > 0) ||
          // Or if the input data is present and not just '0x'
          (tx.input && tx.input !== '0x') ||
          // Or if the value is 0 or very small (often the case for contract calls)
          (parseFloat(tx.value) === 0 || parseFloat(tx.value) < 0.0001)
        ));
      
      // Add token information if found
      return {
        ...tx,
        toToken: toTokenMatch ? {
          symbol: toTokenMatch.symbol,
          name: toTokenMatch.name,
          type: toTokenMatch.type
        } : undefined,
        fromToken: fromTokenMatch ? {
          symbol: fromTokenMatch.symbol,
          name: fromTokenMatch.name,
          type: fromTokenMatch.type
        } : undefined,
        isLikelyContractCall
      };
    });
    
    console.log('🔍 Enriched transactions with token information:', 
      enrichedTransactions.filter(tx => tx.toToken || tx.fromToken).length, 
      'matches found');
    console.log('🔍 Identified potential smart contract calls:', 
      enrichedTransactions.filter(tx => tx.isLikelyContractCall).length);

    // Check if we have a valid API key
    if (!NEXT_PUBLIC_OPENAI_API_KEY || NEXT_PUBLIC_OPENAI_API_KEY === 'YourOpenAIApiKey') {
      console.warn('No valid OpenAI API key found. Using mock suggestions instead.');
      console.log('To get AI analysis, add your OpenAI API key to .env.local as NEXT_PUBLIC_OPENAI_API_KEY');
      return getMockSuggestions(transactions);
    }
    
    // Step 2: Provide some context about token contracts to the AI
    const tokenContext = tokenReferences.map(token => 
      `${token.name} (${token.symbol}): ${token.address} - ${token.type}`
    ).join('\n');

    // Process transactions in batches to avoid overwhelming the API
    console.log(`🔄 Processing ${enrichedTransactions.length} transactions...`);
    
    // Split transactions into smaller batches
    const batches = [];
    for (let i = 0; i < enrichedTransactions.length; i += API_CONFIG.MAX_TRANSACTIONS_PER_BATCH) {
      batches.push(enrichedTransactions.slice(i, i + API_CONFIG.MAX_TRANSACTIONS_PER_BATCH));
    }
    
    console.log(`🔄 Split into ${batches.length} batches of up to ${API_CONFIG.MAX_TRANSACTIONS_PER_BATCH} transactions each`);
    
    const allResults: AISuggestion[] = [];
    
    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      console.log(`🔄 Processing batch ${batchIndex + 1}/${batches.length} with ${batch.length} transactions`);
      
      const prompt = `
        Analyze these Ethereum transactions and suggest appropriate labels and brief descriptions 
        for categorization purposes. For each transaction, include a reason for your label suggestion.
        
        Here is a list of common Ethereum token contracts for reference:
        ${tokenContext}
        
        IMPORTANT ABOUT TRANSACTION TYPES:
        - "normal": A regular ETH transfer with no contract interaction
        - "contractCall": An interaction with an existing smart contract
        - "contractCreation": A transaction that deploys a new contract
        
        IMPORTANT ABOUT SMART CONTRACT INTERACTIONS:
        - For transactions with "transactionType": "contractCall" or "contractCreation" (or "isLikelyContractCall": true), explicitly mention it's a contract interaction
        - If "methodName" is provided, use it to identify what function is being called (e.g., "transfer", "approve", "swap")
        - If name tags ("fromName" or "toName") are provided, use them to provide context about the involved parties
        - Common contract interactions include token approvals, swaps, staking, liquidity provision, and function calls
        - Provide a clear description of what the contract interaction might be doing
        
        IMPORTANT ADDITIONAL TRANSACTION DETAILS:
        - Analyze gas fees (gasFeesEth) to determine if they're high or low, which can indicate complex contract interactions
        - Check transaction status - failed transactions often indicate errors in contract interactions
        - Examine input data - non-empty input data typically indicates contract method calls
        - For high-value transactions, be explicit about the value being transferred
        - When gas fees are notably high relative to the transaction value, mention this in your reasoning
        
        Transactions:
        ${JSON.stringify(batch, null, 2)}
        
        For EVERY transaction in the list (even if you're not sure about its purpose), provide:
        1. A suggested label (like "Exchange Deposit", "NFT Purchase", "Token Swap", "Smart Contract Call", etc.)
        2. A brief description of what the transaction appears to be
        3. A reason explaining why you assigned this label based on the transaction details, including gas fees and input data
        
        Respond with ONLY a valid JSON array where each object contains the following fields:
        - index: the index of the transaction in this batch (0 for the first transaction in this batch)
        - label: your suggested label
        - description: a brief description of the transaction
        - reason: your reasoning for the label
        
        IMPORTANT: Return ONLY raw JSON without any markdown formatting, explanations, or code blocks.
        Do NOT use \`\`\`json or any other formatting. The response must be valid JSON that can be directly parsed.
        Include ALL transactions in your response, even if you're unsure about some.
      `;

      // Start API call with retry logic for this batch
      let content = '';
      let retryCount = 0;
      let success = false;

      while (!success && retryCount <= API_CONFIG.MAX_RETRIES) {
        try {
          if (retryCount > 0) {
            console.log(`🔄 Retry attempt ${retryCount}/${API_CONFIG.MAX_RETRIES} after rate limit...`);
            // Wait with exponential backoff before retrying
            await delay(API_CONFIG.INITIAL_RETRY_DELAY * Math.pow(2, retryCount - 1));
          }

          const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
              model: 'gpt-4-turbo-preview', // Using the latest available model
              messages: [
                {
                  role: 'system',
                  content: 'You are a specialized cryptocurrency transaction analyzer that provides detailed analysis of Ethereum transactions. You always include a label, description, and reasoning for each transaction.'
                },
                {
                  role: 'user',
                  content: prompt
                }
              ],
              temperature: 0.5, // Lower temperature for more consistent results
              max_tokens: 4000  // Increased from 1500 to 2500 for more detailed analysis
            },
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${NEXT_PUBLIC_OPENAI_API_KEY}`
              }
            }
          );

          // If we get here, the call was successful
          content = response.data.choices[0].message.content;
          success = true;
        } catch (apiError: unknown) {
          // Type guard for axios error
          if (axios.isAxiosError(apiError) && apiError.response?.status === 429) {
            retryCount++;
            if (retryCount > API_CONFIG.MAX_RETRIES) {
              console.error('❌ Rate limit exceeded and max retries reached.');
              throw new Error('Rate limit exceeded. Please try again later.');
            }
            // Continue to next iteration which will wait and retry
          } else {
            // For other errors, just throw them to be caught by the outer try/catch
            throw apiError;
          }
        }
      }
      
      // Clean the response - remove markdown code block formatting if present
      let cleanedContent = content;
      
      // Check if the response is wrapped in a markdown code block
      if (content.includes('```json') || content.includes('```')) {
        // Extract just the JSON part by removing markdown formatting
        cleanedContent = content
          .replace(/^```json\s*\n/, '') // Remove opening ```json
          .replace(/^```\s*\n/, '')     // Remove opening ``` (without json)
          .replace(/\n```\s*$/, '')     // Remove closing ```
          .trim();
      }
      
      try {
        const batchSuggestions = JSON.parse(cleanedContent);
        
        // Adjust the indices to match position in full array
        const batchOffset = batchIndex * API_CONFIG.MAX_TRANSACTIONS_PER_BATCH;
        const adjustedSuggestions = batchSuggestions.map((suggestion: AISuggestion) => ({
          ...suggestion,
          index: suggestion.index + batchOffset
        }));
        
        // Add to our results
        allResults.push(...adjustedSuggestions);
        
        // Add a small delay between batches to avoid rate limits
        if (batchIndex < batches.length - 1) {
          await delay(500); // 500ms breathing room between batches
        }
      } catch (jsonError) {
        console.error(`JSON parsing error in batch ${batchIndex + 1}:`, jsonError);
        console.error('Content that failed to parse:', cleanedContent);
        // Continue with next batch instead of failing completely
      }
    }
      
    // Step 3: Verify we have a suggestion for each transaction
    // If the AI missed any, create generic ones to ensure all transactions are covered
    const allTransactionSuggestions: AISuggestion[] = [];
    
    transactions.forEach((tx, index) => {
      // Find if this transaction has a suggestion
      const existingSuggestion = allResults.find((s: AISuggestion) => s.index === index);
      
      if (existingSuggestion) {
        // Add token match information if available
        const toTokenMatch = tx.to ? findTokenByAddress(tx.to) : undefined;
        const fromTokenMatch = tx.from ? findTokenByAddress(tx.from) : undefined;
        
        const tokenMatch = toTokenMatch || fromTokenMatch;
        
        allTransactionSuggestions.push({
          ...existingSuggestion,
          tokenMatch: tokenMatch ? {
            symbol: tokenMatch.symbol,
            name: tokenMatch.name,
            type: tokenMatch.type
          } : undefined
        });
      } else {
        // Create a generic suggestion for this transaction
        const toTokenMatch = tx.to ? findTokenByAddress(tx.to) : undefined;
        const fromTokenMatch = tx.from ? findTokenByAddress(tx.from) : undefined;
        
        const tokenMatch = toTokenMatch || fromTokenMatch;
        let genericLabel = 'ETH Transfer';
        let genericDescription = `Transfer of ${tx.value} ETH`;
        let genericReason = 'Basic ETH transfer with no additional context';
        
        // If we have a token match, use that information
        if (tokenMatch) {
          genericLabel = `${tokenMatch.symbol} ${tokenMatch.type === 'stablecoin' ? 'Stablecoin' : 'Token'} Interaction`;
          genericDescription = `Interaction with ${tokenMatch.name} (${tokenMatch.symbol})`;
          genericReason = `The address ${toTokenMatch ? 'to' : 'from'} matches the ${tokenMatch.name} contract`;
        }
        
        allTransactionSuggestions.push({
          index,
          label: genericLabel,
          description: genericDescription,
          reason: genericReason,
          tokenMatch: tokenMatch ? {
            symbol: tokenMatch.symbol,
            name: tokenMatch.name,
            type: tokenMatch.type
          } : undefined
        });
      }
    });
    
    return allTransactionSuggestions;
  } catch (error) {
    console.error('Error analyzing transactions with AI:', error);
    // Fallback to mock suggestions
    return getMockSuggestions(transactions);
  }
}

// Provide mock suggestions for development purposes
function getMockSuggestions(transactions: Transaction[]): AISuggestion[] {
  const categories = [
    'Exchange Deposit', 'Exchange Withdrawal', 'DeFi Staking',
    'NFT Purchase', 'Trading Fee', 'Token Swap', 'Savings Deposit',
    'Loan Repayment', 'Payment for Services', 'Donation'
  ];
  
  const contractCategories = [
    'Smart Contract Call: Token Approval',
    'Smart Contract Call: Swap Tokens',
    'Smart Contract Call: Liquidity Provision',
    'Smart Contract Call: Governance Vote',
    'Smart Contract Call: Yield Farming',
    'Smart Contract Call: NFT Minting',
    'Smart Contract Creation'
  ];

  // Enhanced descriptions that include gas fee references
  const descriptions = [
    'Transfer of ETH to an exchange wallet with standard gas fees',
    'Withdrawal of ETH from exchange to personal wallet, paid higher gas for priority',
    'Deposited tokens into a staking contract, higher gas due to complex contract interaction',
    'Purchased an NFT collection item with significant gas fees during network congestion',
    'Paid trading fees for DEX operations, small gas cost relative to trading volume',
    'Swapped tokens using a decentralized exchange with moderate gas costs',
    'Deposited funds into a savings protocol with minimal gas fees',
    'Repaid a DeFi loan with standard transaction gas',
    'Made a payment for digital services with low gas priority',
    'Donation to a crypto charity project, standard gas fees'
  ];

  const contractDescriptions = [
    'Approved a token for trading on a DEX, low gas cost operation',
    'Swapped tokens using Uniswap with higher gas due to price slippage protection',
    'Added liquidity to a trading pair, high gas due to multiple contract interactions',
    'Cast a vote in a DAO governance proposal, moderate gas cost',
    'Staked tokens in a yield farming protocol with standard gas',
    'Minted an NFT with premium gas during a popular drop',
    'Deployed a new smart contract to the Ethereum network'
  ];

  const reasons = [
    'Pattern matches typical exchange deposit with normal gas usage',
    'Withdrawal address is associated with a personal wallet, gas fees appropriate for transaction type',
    'Contract interaction with a known staking protocol, gas fee indicates complex operation',
    'Transaction to a known NFT marketplace contract with gas usage typical of NFT purchases',
    'Small ETH amount sent to contract with gas fees in expected range for trading',
    'Zero ETH value with contract interaction signature and gas fees consistent with token swaps',
    'Destination is a known savings protocol with minimal gas cost indicating simple deposit',
    'Repayment pattern to lending protocol with standard gas for transaction type',
    'Small fixed amount with regular gas indicating payment for services',
    'Round number amount sent to a charity address with appropriate gas for simple transfer'
  ];

  const contractReasons = [
    'Standard token approval method signature in contract data with gas usage typical for approvals',
    'Input data contains swap function signatures, gas cost reflects complexity of swap operation',
    'Multiple token transfers in a single transaction with gas fees indicating adding liquidity',
    'Small gas operation to governance contract with vote function signature',
    'Contract interaction with farming protocol, gas reflects staking operation complexity',
    'Interaction with NFT contract containing mint function, high gas due to storage costs',
    'High gas cost transaction with empty "to" field indicates contract deployment'
  ];

  return transactions.map((tx, index) => {
    // Decide if this is a contract interaction based on transaction type or fallback to input data/gas fees
    const isContractInteraction = 
      tx.transactionType === 'contractCall' || 
      tx.transactionType === 'contractCreation' ||
      (tx.input && tx.input !== '0x') || 
      (tx.gasFeesEth && parseFloat(tx.gasFeesEth) > 0.005);
    
    const isContractCreation = tx.transactionType === 'contractCreation';
    
    const categoryPool = isContractInteraction ? contractCategories : categories;
    const descriptionPool = isContractInteraction ? contractDescriptions : descriptions;
    const reasonPool = isContractInteraction ? contractReasons : reasons;
    
    // Select based on transaction hash to keep it consistent
    const hash = tx.hash || String(index);
    const seed = hash.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    const categoryIndex = seed % categoryPool.length;
    const descriptionIndex = (seed + 1) % descriptionPool.length;
    const reasonIndex = (seed + 2) % reasonPool.length;
    
    // Override with more specific information if available
    let label = categoryPool[categoryIndex];
    let description = descriptionPool[descriptionIndex];
    let reason = reasonPool[reasonIndex];
    
    // Use method name if available
    if (tx.methodName && tx.transactionType === 'contractCall') {
      label = `Smart Contract Call: ${tx.methodName.charAt(0).toUpperCase() + tx.methodName.slice(1)}`;
      description = `Called the ${tx.methodName} function on a smart contract`;
      reason = `Transaction identified as a contract call with method ${tx.methodName} (ID: ${tx.methodId || 'unknown'})`;
    }
    
    // Handle contract creation specially
    if (isContractCreation) {
      label = 'Smart Contract Creation';
      description = 'Deployed a new smart contract to the Ethereum network';
      reason = 'Transaction has no recipient address and contains contract bytecode, indicating contract deployment';
    }
    
    // Add name tag context if available
    if (tx.fromName || tx.toName) {
      let parties = '';
      if (tx.fromName) {
        parties += `from ${tx.fromName} `;
      }
      if (tx.toName) {
        parties += `to ${tx.toName}`;
      }
      description += ` ${parties.trim()}`;
      reason += ` Transaction ${tx.fromName ? `from known entity "${tx.fromName}"` : ''} ${tx.toName ? `to known entity "${tx.toName}"` : ''}.`;
    }
    
    // Add gas fee context to the descriptions
    let enhancedDescription = description;
    let enhancedReason = reason;
    
    if (tx.gasFeesEth) {
      const gasFee = parseFloat(tx.gasFeesEth);
      
      if (gasFee > 0.01) {
        enhancedDescription += ` (high gas fee: ${gasFee.toFixed(4)} ETH)`;
        enhancedReason += `. The high gas fees of ${gasFee.toFixed(4)} ETH suggest complex contract interactions.`;
      } else if (gasFee > 0.005) {
        enhancedDescription += ` (moderate gas fee: ${gasFee.toFixed(4)} ETH)`;
        enhancedReason += `. Moderate gas fees of ${gasFee.toFixed(4)} ETH are typical for this operation.`;
      } else {
        enhancedDescription += ` (low gas fee: ${gasFee.toFixed(4)} ETH)`;
        enhancedReason += `. Low gas fees of ${gasFee.toFixed(4)} ETH indicate a simple transaction.`;
      }
    }
    
    // Add input data context
    if (tx.input && tx.input !== '0x') {
      enhancedReason += ` Transaction includes input data which suggests interaction with contract functions.`;
    }
    
    // Add transaction status context
    if (tx.status === 'Failed') {
      enhancedDescription = `Failed: ${enhancedDescription}`;
      enhancedReason += ` Transaction failed, possibly due to contract errors or gas limitations.`;
    }
    
    return {
      index,
      label,
      description: enhancedDescription,
      reason: enhancedReason
    };
  });
} 