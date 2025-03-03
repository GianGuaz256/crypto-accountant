'use client';

import { useState, useEffect } from 'react';
import { Transaction } from '@/utils/transactionFetcher';
import { AISuggestion, analyzeTransactions } from '@/utils/aiAnalyzer';
import { saveTransactions } from '@/utils/localStorageUtils';
import { toast } from 'sonner';

interface AIInsightsProps {
  transactions: Transaction[];
  onTransactionsChange?: (transactions: Transaction[]) => void;
}

export default function AIInsights({ 
  transactions, 
  onTransactionsChange 
}: AIInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  // Track which transaction indices have had suggestions applied
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());
  // Track loading steps
  const [loadingStep, setLoadingStep] = useState<string>('');
  // Track local transactions state to show UI updates immediately
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);

  // Update local transactions when parent transactions change
  useEffect(() => {
    setLocalTransactions(transactions);
  }, [transactions]);

  // Request AI suggestions for transactions
  const handleAnalyzeClick = async () => {
    if (localTransactions.length === 0) {
      setError('No transactions to analyze.');
      toast.error('No transactions to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setSuggestions([]);
    setAppliedSuggestions(new Set());
    setLoadingStep('Preparing transaction data...');
    
    try {
      // Simulate the loading steps with slight delays for UX
      setTimeout(() => setLoadingStep('Sending data to AI for analysis...'), 800);
      setTimeout(() => setLoadingStep('Processing with GPT-4...'), 1500);
      setTimeout(() => setLoadingStep('Analyzing transaction patterns...'), 3000);
      
      console.log('Requesting AI analysis for', localTransactions.length, 'transactions');
      const result = await analyzeTransactions(localTransactions);
      
      setLoadingStep('Processing AI response...');
      
      // Validate the AI response
      if (!Array.isArray(result)) {
        throw new Error('Invalid response format from AI analyzer');
      }
      
      console.log('Received', result.length, 'suggestions from AI');
      setSuggestions(result);
      setLoadingStep('Analysis complete!');
    } catch (err) {
      console.error('Error analyzing transactions:', err);
      const errorMessage = `Failed to analyze transactions: ${err instanceof Error ? err.message : 'Unknown error'}`;
      setError(errorMessage);
      
      // Ensure toast is shown with more detail for debugging
      toast.error(
        <div>
          <p className="font-semibold">AI Analysis Error</p>
          <p className="text-sm">{errorMessage}</p>
          {err instanceof Error && err.stack && (
            <details className="text-xs mt-2">
              <summary>Technical details</summary>
              <pre className="mt-1 max-h-40 overflow-auto">{err.stack}</pre>
            </details>
          )}
        </div>
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Apply a single AI suggestion to a transaction
  const applySuggestion = (suggestion: AISuggestion) => {
    // First create a deep copy of the transactions array to avoid mutation
    const updatedTransactions = [...localTransactions];
    
    // Update the transaction at the specified index
    if (updatedTransactions[suggestion.index]) {
      const oldLabel = updatedTransactions[suggestion.index].label;
      const oldDescription = updatedTransactions[suggestion.index].description;
      
      // Update the transaction with the AI suggestion
      updatedTransactions[suggestion.index] = {
        ...updatedTransactions[suggestion.index],
        label: suggestion.label,
        description: suggestion.description
      };
      
      // Update local state for immediate UI feedback
      setLocalTransactions(updatedTransactions);
      
      // Save to local storage
      saveTransactions(updatedTransactions);
      
      // Mark this suggestion as applied
      setAppliedSuggestions(prev => {
        const updated = new Set(prev);
        updated.add(suggestion.index);
        return updated;
      });
      
      console.log(`Applied suggestion at index ${suggestion.index}:`);
      console.log(`- Changed label from "${oldLabel || 'None'}" to "${suggestion.label}"`);
      console.log(`- Changed description from "${oldDescription || 'None'}" to "${suggestion.description}"`);
      console.log('Updated transactions:', updatedTransactions);
      
      // Call the parent callback to update the main transactions list
      if (onTransactionsChange) {
        console.log('Calling onTransactionsChange with updated transactions');
        onTransactionsChange(updatedTransactions);
      } else {
        console.warn('No onTransactionsChange callback provided - parent component will not be updated');
      }
    }
  };

  // Apply all AI suggestions to their respective transactions
  const applyAllSuggestions = () => {
    // Create a deep copy of the transactions array
    const updatedTransactions = [...localTransactions];
    const newApplied = new Set<number>();
    
    console.log(`Applying all ${suggestions.length} suggestions to transactions`);
    
    // Keep track of changes for logging
    const changes: Array<{index: number, oldLabel: string, newLabel: string}> = [];
    
    // Update all transactions with their corresponding suggestions
    suggestions.forEach(suggestion => {
      if (updatedTransactions[suggestion.index]) {
        const oldLabel = updatedTransactions[suggestion.index].label;
        
        // Apply each suggestion to its corresponding transaction
        updatedTransactions[suggestion.index] = {
          ...updatedTransactions[suggestion.index],
          label: suggestion.label,
          description: suggestion.description
        };
        
        newApplied.add(suggestion.index);
        
        // Track changes for logging
        changes.push({
          index: suggestion.index,
          oldLabel: oldLabel || 'None',
          newLabel: suggestion.label
        });
      }
    });
    
    // Update local state first for immediate UI feedback
    setLocalTransactions(updatedTransactions);
    setAppliedSuggestions(newApplied);
    
    // Save to local storage
    saveTransactions(updatedTransactions);
    
    console.log(`Applied ${newApplied.size} suggestions to transactions:`);
    changes.forEach(change => {
      console.log(`- Transaction ${change.index}: Changed label from "${change.oldLabel}" to "${change.newLabel}"`);
    });
    
    // Call the parent callback to update the main transactions list
    if (onTransactionsChange) {
      console.log('Calling onTransactionsChange with all updated transactions');
      onTransactionsChange(updatedTransactions);
    } else {
      console.warn('No onTransactionsChange callback provided - parent component will not be updated');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4">AI Transaction Analysis</h2>
      
      <button
        onClick={handleAnalyzeClick}
        disabled={localTransactions.length === 0 || isAnalyzing}
        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50"
      >
        {isAnalyzing ? "Analyzing..." : "Analyze Transactions with AI"}
      </button>
      
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
        Use AI to automatically label and describe your transactions based on patterns and context.
      </p>
      
      {isAnalyzing && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
            </div>
            <p className="font-medium text-purple-600 dark:text-purple-400 mb-2">
              Analyzing Your Transactions
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loadingStep}
            </p>
          </div>
        </div>
      )}
      
      {error && !isAnalyzing && (
        <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}
      
      {suggestions.length > 0 && !isAnalyzing && (
        <div className="mt-4 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            <button
              onClick={applyAllSuggestions}
              className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
            >
              Apply All Suggestions
            </button>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion) => {
              const tx = localTransactions[suggestion.index];
              const isApplied = appliedSuggestions.has(suggestion.index);
              
              return (
                <div 
                  key={suggestion.index}
                  className={`p-3 border rounded-md ${
                    isApplied 
                      ? 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800' 
                      : 'bg-gray-50 dark:bg-gray-900'
                  }`}
                >
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-bold">
                          Transaction {suggestion.index + 1}: {tx?.value} ETH
                        </p>
                        {suggestion.tokenMatch && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            suggestion.tokenMatch.type === 'stablecoin' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : suggestion.tokenMatch.type === 'utility'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          }`}>
                            {suggestion.tokenMatch.symbol}
                          </span>
                        )}
                        {isApplied && (
                          <span className="text-xs px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded">
                            Applied
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3 mb-2">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Current Label</p>
                          <p className="text-sm">{isApplied ? suggestion.label : tx?.label || 'None'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Suggested Label</p>
                          <p className={`text-sm font-medium ${isApplied ? 'text-green-700 dark:text-green-400' : 'text-purple-700 dark:text-purple-400'}`}>
                            {suggestion.label}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Suggested Description</p>
                        <p className="text-sm">{suggestion.description}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Reason</p>
                        <p className="text-sm italic">{suggestion.reason}</p>
                      </div>
                    </div>
                    {!isApplied ? (
                      <button
                        onClick={() => applySuggestion(suggestion)}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 h-fit"
                      >
                        Apply
                      </button>
                    ) : (
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {!isAnalyzing && suggestions.length === 0 && !error && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            Click the button above to analyze your transactions with AI and get suggested labels and descriptions.
          </p>
        </div>
      )}
    </div>
  );
}