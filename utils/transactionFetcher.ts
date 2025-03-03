import axios from 'axios';
import { formatEther } from 'ethers';

export interface Transaction {
  date: string;
  from: string;
  to: string;
  value: string;
  label?: string;
  description?: string;
  hash?: string;
  gasUsed?: string;
  gasPrice?: string;
  gasFeesEth?: string;
  timestamp?: string;
  blockNumber?: string;
  status?: string;
  isError?: string;
  input?: string;
  // New fields for transaction type and name tags
  transactionType?: 'normal' | 'contractCreation' | 'contractCall';
  methodName?: string;
  methodId?: string;
  fromName?: string;
  toName?: string;
}

// Define a type for Etherscan transaction responses
interface EtherscanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  gasUsed?: string;
  input: string;
  isError: string;
  txreceipt_status: string;
}

// Get API key from environment variable or use placeholder
const NEXT_PUBLIC_ETHERSCAN_API_KEY = 
  typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY 
    ? process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY 
    : 'YourEtherscanApiKey'; // Fallback for development

// Define a list of common method IDs and their names
const COMMON_METHOD_IDS: Record<string, string> = {
  '0xa9059cbb': 'transfer',
  '0x23b872dd': 'transferFrom',
  '0x095ea7b3': 'approve',
  '0x70a08231': 'balanceOf',
  '0xdd62ed3e': 'allowance',
  '0x313ce567': 'decimals',
  '0x06fdde03': 'name',
  '0x95d89b41': 'symbol',
  '0x18160ddd': 'totalSupply',
  '0x42842e0e': 'safeTransferFrom',
  '0xb88d4fde': 'safeTransferFrom',
  '0xf242432a': 'safeTransferFrom',
  '0x2eb2c2d6': 'safeBatchTransferFrom',
  '0xc9567bf9': 'safeTransferpubblicazione',
  '0x7c025200': 'swap',
  '0x38ed1739': 'swapExactTokensForTokens',
  '0x7ff36ab5': 'swapExactETHForTokens',
  '0x4a25d94a': 'swapTokensForExactETH',
  '0x5c11d795': 'swapExactTokensForETH',
  '0xfb3bdb41': 'swapETHForExactTokens',
  '0x18cbafe5': 'swapExactTokensForETHSupportingFeeOnTransferTokens',
  '0xa0712d68': 'mint',
  '0x40c10f19': 'mint',
  '0x6a627842': 'mint',
  '0xa9059cbb2ab09eb219583f4a59a5d0623ade346d962bcd4e46b11da047c9049b': 'transfer'
};

// Known address tags to reduce API calls to Etherscan
const KNOWN_ADDRESS_TAGS: Record<string, string> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH Token',
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC Token',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT Token',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI Token',
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'Uniswap V2: Router',
  '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b': 'OpenSea: Wyvern Exchange',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'Uniswap V3: Router',
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': '0x: Exchange Proxy',
  '0xd9e1ce17f2641f24ae83637ab66a2cca9c378b9f': 'SushiSwap: Router',
  '0x881d40237659c251811cec9c364ef91dc08d300c': 'Metamask Swap Router',
  '0x000000000000ad05ccc4f10045630fb830b95127': 'Blur.io: Exchange',
  '0x00000000006c3852cbef3e08e8df289169ede581': 'Seaport 1.1',
  '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce': 'SHIB Token',
  '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984': 'UNI Token',
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': 'WBTC Token',
  '0x514910771af9ca656af840dff83e8264ecf986ca': 'LINK Token'
};

// Cache for address name tags to avoid repeated API calls
const addressTagsCache: Record<string, string> = {};

// Function to retrieve address name tags from Etherscan or cache
async function fetchAddressNameTag(address: string): Promise<string> {
  // Normalize address to lowercase
  const normalizedAddress = address.toLowerCase();
  
  // Check cache first
  if (addressTagsCache[normalizedAddress]) {
    return addressTagsCache[normalizedAddress];
  }
  
  // Check known addresses
  if (KNOWN_ADDRESS_TAGS[normalizedAddress]) {
    // Store in cache and return
    addressTagsCache[normalizedAddress] = KNOWN_ADDRESS_TAGS[normalizedAddress];
    return KNOWN_ADDRESS_TAGS[normalizedAddress];
  }
  
  // If we don't have a valid API key, don't try to fetch
  if (!NEXT_PUBLIC_ETHERSCAN_API_KEY || NEXT_PUBLIC_ETHERSCAN_API_KEY === 'YourEtherscanApiKey') {
    return '';
  }
  
  try {
    // Try to fetch address label from Etherscan
    const response = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'contract',
        action: 'getsourcecode',
        address: address,
        apikey: NEXT_PUBLIC_ETHERSCAN_API_KEY
      }
    });
    
    // Check if we got a valid response
    if (response.data.status === '1' && response.data.result && response.data.result.length > 0) {
      const contractName = response.data.result[0].ContractName;
      if (contractName && contractName !== '') {
        // Store the name in cache
        addressTagsCache[normalizedAddress] = contractName;
        return contractName;
      }
    }
    
    // If contract name lookup fails, try address tags
    const labelResponse = await axios.get(`https://api.etherscan.io/api`, {
      params: {
        module: 'account',
        action: 'txlistinternal',
        address: address,
        page: 1,
        offset: 1,
        apikey: NEXT_PUBLIC_ETHERSCAN_API_KEY
      }
    });
    
    // Parse the response - sometimes Etherscan provides a name in the warning message for known addresses
    const warningMessage = labelResponse.data.message || '';
    if (warningMessage.includes('known as')) {
      const nameMatch = warningMessage.match(/known as \[(.*?)\]/);
      if (nameMatch && nameMatch[1]) {
        // Store the name in cache
        addressTagsCache[normalizedAddress] = nameMatch[1];
        return nameMatch[1];
      }
    }
    
    // No name found
    addressTagsCache[normalizedAddress] = ''; // Cache empty result to avoid future lookups
    return '';
  } catch (error) {
    console.log(`⚠️ Error fetching name tag for address ${address}:`, error);
    addressTagsCache[normalizedAddress] = ''; // Cache empty result on error
    return '';
  }
}

// Function to batch fetch name tags for multiple addresses
async function fetchNameTagsForAddresses(addresses: string[]): Promise<Record<string, string>> {
  // Deduplicate addresses
  const uniqueAddresses = [...new Set(addresses)].filter(addr => addr && addr !== '0x' && addr !== '');
  
  // Create a map to store results
  const nameTags: Record<string, string> = {};
  
  // Process in small batches to avoid rate limits (5 at a time)
  for (let i = 0; i < uniqueAddresses.length; i += 5) {
    const batch = uniqueAddresses.slice(i, i + 5);
    const promises = batch.map(address => fetchAddressNameTag(address));
    
    try {
      const results = await Promise.all(promises);
      batch.forEach((address, index) => {
        if (results[index]) {
          nameTags[address.toLowerCase()] = results[index];
        }
      });
      
      // Small delay between batches to be nice to the API
      if (i + 5 < uniqueAddresses.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.log('⚠️ Error fetching name tags for batch:', error);
      // Continue with the next batch
    }
  }
  
  return nameTags;
}

// Function to identify transaction type and method
function identifyTransactionType(tx: EtherscanTransaction): {
  transactionType: 'normal' | 'contractCreation' | 'contractCall';
  methodName: string;
  methodId: string;
} {
  // Check if it's a contract creation
  if (tx.to === '' || tx.to === null || tx.to === '0x') {
    return {
      transactionType: 'contractCreation',
      methodName: 'Contract Creation',
      methodId: ''
    };
  }
  
  // Check if it has input data (beyond just '0x')
  if (tx.input && tx.input.length > 2 && tx.input !== '0x') {
    // Extract method ID (first 10 characters including '0x')
    const methodId = tx.input.substring(0, 10);
    const methodName = COMMON_METHOD_IDS[methodId] || 'Unknown Method';
    
    return {
      transactionType: 'contractCall',
      methodName,
      methodId
    };
  }
  
  // If none of the above, it's a normal transfer
  return {
    transactionType: 'normal',
    methodName: 'Transfer',
    methodId: ''
  };
}

/* 
// Function to fetch address name tags from Etherscan
// Currently not used - will be implemented in future updates
async function fetchAddressNameTags(address: string): Promise<string> {
  if (!NEXT_PUBLIC_ETHERSCAN_API_KEY || NEXT_PUBLIC_ETHERSCAN_API_KEY === 'YourEtherscanApiKey') {
    return '';
  }

  try {
    // Unfortunately, Etherscan API doesn't directly provide a way to get the name tag
    // We could scrape it from the HTML response, but that's fragile and not recommended
    // For now, we'll just return an empty string and note that this would require
    // a more specialized approach or a premium API to get this information
    return '';
  } catch (error) {
    console.error('Error fetching address name tag:', error);
    return '';
  }
}
*/

export async function fetchTransactions(address: string): Promise<Transaction[]> {
  console.log('🔍 Fetching transactions for address:', address);
  
  try {
    // Check if we have a valid API key
    if (!NEXT_PUBLIC_ETHERSCAN_API_KEY || NEXT_PUBLIC_ETHERSCAN_API_KEY === 'YourEtherscanApiKey') {
      console.log('⚠️ No valid Etherscan API key found. Please configure an API key in your environment.');
      return [];
    }

    // Fetching normal transactions
    const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${NEXT_PUBLIC_ETHERSCAN_API_KEY}`;
    console.log('🌐 Requesting data from URL:', url.replace(NEXT_PUBLIC_ETHERSCAN_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await axios.get(url);
    console.log('📡 Etherscan API response status:', response.status);
    console.log('📡 Etherscan data status:', response.data.status);
    console.log('📡 Etherscan message:', response.data.message);
    
    if (response.data.status !== '1') {
      console.log('❌ Error from Etherscan API:', response.data.message);
      return [];
    }
    
    if (!response.data.result || !Array.isArray(response.data.result)) {
      console.log('❌ Invalid response structure from Etherscan - result is not an array:', response.data);
      return [];
    }
    
    console.log(`✅ Successfully fetched ${response.data.result.length} transactions from Etherscan`);
    
    // Log a sample transaction to debug structure
    if (response.data.result.length > 0) {
      console.log('📋 Sample transaction from Etherscan:', response.data.result[0]);
    }
    
    const transactions = response.data.result.map((tx: EtherscanTransaction) => {
      // Calculate gas fee in ETH
      const gasUsed = tx.gasUsed || tx.gas; // Use gasUsed if available, otherwise fall back to gas
      const gasFeeWei = BigInt(gasUsed) * BigInt(tx.gasPrice);
      const gasFeeEth = formatEther(gasFeeWei.toString());
      
      // Parse the timestamp to a Date object
      const date = new Date(parseInt(tx.timeStamp) * 1000);
      
      // Format the date as a readable string
      const formattedDate = date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Get transaction type and method information
      const { transactionType, methodName, methodId } = identifyTransactionType(tx);
      
      return {
        date: formattedDate,
        from: tx.from,
        to: tx.to || '', // Handle contract creation where 'to' is empty
        value: formatEther(tx.value),
        hash: tx.hash,
        gasUsed: gasUsed,
        gasPrice: tx.gasPrice,
        gasFeesEth: gasFeeEth,
        timestamp: tx.timeStamp,
        blockNumber: tx.blockNumber,
        isError: tx.isError,
        status: tx.txreceipt_status === '1' ? 'Success' : 'Failed',
        input: tx.input,
        // Adding transaction type and method information
        transactionType,
        methodName,
        methodId,
        fromName: '', // Will be populated with name tags if available
        toName: '',  // Will be populated with name tags if available
        // Adding empty label and description fields that will be filled by the user
        label: '',
        description: ''
      };
    });
    
    // Extract all unique addresses for name tag lookup
    const uniqueAddresses = new Set<string>();
    transactions.forEach((tx: EtherscanTransaction) => {
      if (tx.from) uniqueAddresses.add(tx.from);
      if (tx.to) uniqueAddresses.add(tx.to);
    });
    
    // Fetch name tags for all addresses
    console.log(`🔍 Fetching name tags for ${uniqueAddresses.size} unique addresses`);
    const nameTags = await fetchNameTagsForAddresses(Array.from(uniqueAddresses));
    console.log(`✅ Retrieved ${Object.keys(nameTags).length} name tags`);
    
    // Map transactions to our format
    const mappedTransactions = transactions.map((tx: EtherscanTransaction) => {
      return {
        ...tx,
        fromName: nameTags[tx.from.toLowerCase()] || '',
        toName: tx.to ? nameTags[tx.to.toLowerCase()] || '' : '',
      };
    });
    
    console.log(`✅ Successfully mapped ${mappedTransactions.length} transactions`);
    console.log('📋 First mapped transaction:', mappedTransactions[0]);
    
    return mappedTransactions;
  } catch (error) {
    console.log('❌ Exception during transaction fetching:', error instanceof Error ? error.message : 'Unknown error');
    console.log('❌ Full error:', error);
    return [];
  }
}

export async function fetchTransactionDetails(hash: string): Promise<Transaction | null> {
  console.log('🔍 Fetching details for transaction:', hash);
  
  try {
    if (!NEXT_PUBLIC_ETHERSCAN_API_KEY || NEXT_PUBLIC_ETHERSCAN_API_KEY === 'YourEtherscanApiKey') {
      console.log('⚠️ No valid Etherscan API key found. Cannot fetch transaction details');
      return null;
    }

    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionByHash&txhash=${hash}&apikey=${NEXT_PUBLIC_ETHERSCAN_API_KEY}`;
    console.log('🌐 Requesting transaction details from URL:', url.replace(NEXT_PUBLIC_ETHERSCAN_API_KEY, 'API_KEY_HIDDEN'));
    
    const response = await axios.get(url);
    
    if (!response.data.result) {
      console.log('❌ Error fetching transaction details:', response.data.message || 'Unknown error');
      return null;
    }
    
    // Also fetch the receipt to get gas used
    const receiptUrl = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}&apikey=${NEXT_PUBLIC_ETHERSCAN_API_KEY}`;
    const receiptResponse = await axios.get(receiptUrl);
    
    if (!receiptResponse.data.result) {
      console.log('❌ Error fetching transaction receipt:', receiptResponse.data.message || 'Unknown error');
      return null;
    }
    
    const txData = response.data.result;
    const receiptData = receiptResponse.data.result;
    
    // Convert hex values to decimal
    const value = parseInt(txData.value, 16).toString();
    const gasPrice = parseInt(txData.gasPrice, 16).toString();
    const gasUsed = parseInt(receiptData.gasUsed, 16).toString();
    
    // Calculate gas fee in ETH
    const gasFeeWei = BigInt(gasPrice) * BigInt(gasUsed);
    const gasFeeEth = formatEther(gasFeeWei.toString());
    
    return {
      hash: txData.hash,
      from: txData.from,
      to: txData.to,
      value: formatEther(value),
      blockNumber: parseInt(txData.blockNumber, 16).toString(),
      input: txData.input,
      gasPrice,
      gasUsed,
      gasFeesEth: gasFeeEth,
      status: receiptData.status === '0x1' ? 'Success' : 'Failed',
      // We don't have timestamp in this API, so it will be undefined
      date: new Date().toLocaleDateString(), // Placeholder until we can get the actual date
      label: '',
      description: '',
      transactionType: 'normal',
      methodName: '',
      methodId: '',
      fromName: '',
      toName: ''
    };
  } catch (error) {
    console.log('❌ Exception during transaction detail fetching:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
} 