'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction, fetchTransactions } from './transactionFetcher';
import { getTransactions, saveTransactions } from './localStorageUtils';

export function useTransactions(walletAddress: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Create a reusable load transactions function
  const loadTransactions = useCallback(async (address: string | null) => {
    if (!address) {
      console.log('❌ No wallet address provided. Skipping transaction fetch.');
      return;
    }
    
    console.log('🔄 Starting transaction loading process for address:', address);
    setIsLoading(true);
    setError(null);
    
    try {
      // First try to load from localStorage
      console.log('💾 Attempting to load transactions from local storage');
      const savedTransactions = getTransactions();
      console.log(`💾 Local storage returned ${savedTransactions?.length || 0} transactions`);
      
      if (savedTransactions && savedTransactions.length > 0) {
        console.log('💾 Using transactions from local storage while fetching fresh data');
        setTransactions(savedTransactions);
        console.log('📊 Sample transaction from localStorage:', savedTransactions[0]);
      } else {
        console.log('💾 No transactions found in local storage');
      }
      
      // Then fetch fresh transactions in the background
      console.log('🔄 Fetching fresh transactions from Etherscan for address:', address);
      const fetchedTransactions = await fetchTransactions(address);
      console.log(`🔄 Fetched ${fetchedTransactions.length} transactions from API/mock`);
      
      // We might want to merge with existing data to preserve labels/descriptions
      console.log('🔄 Merging fetched transactions with local data to preserve user edits');
      const mergedTransactions = mergeTransactionData(fetchedTransactions, savedTransactions || []);
      console.log(`🔄 After merging: ${mergedTransactions.length} transactions`);
      
      setTransactions(mergedTransactions);
      console.log('💾 Saving merged transactions to local storage');
      saveTransactions(mergedTransactions);
      console.log('✅ Transaction loading process completed successfully');
    } catch (err) {
      console.log('❌ Error during transaction loading process:', err);
      setError('Failed to load transactions. Using local data if available.');
      
      // Try to get data from localStorage as fallback
      const savedTransactions = getTransactions();
      if (savedTransactions && savedTransactions.length > 0) {
        console.log('💾 Using cached transactions from local storage due to fetch error');
        setTransactions(savedTransactions);
      } else {
        console.log('❌ No cached transactions available as fallback');
      }
    } finally {
      setIsLoading(false);
      console.log('🔄 Transaction loading state completed, isLoading set to false');
    }
  }, []);
  
  // Add a function to manually refetch transactions
  const refetchTransactions = useCallback(() => {
    console.log('🔄 Manually refetching transactions...');
    return loadTransactions(walletAddress);
  }, [walletAddress, loadTransactions]);

  useEffect(() => {
    console.log('👛 useTransactions hook - wallet address changed:', walletAddress);
    loadTransactions(walletAddress);
  }, [walletAddress, loadTransactions]);

  // Update a single transaction
  const updateTransaction = (index: number, updates: Partial<Transaction>) => {
    console.log(`✏️ Updating transaction at index ${index}:`, updates);
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = { ...updatedTransactions[index], ...updates };
    setTransactions(updatedTransactions);
    console.log('💾 Saving updated transactions to local storage');
    saveTransactions(updatedTransactions);
  };

  console.log(`🔄 useTransactions current state: ${transactions.length} transactions, loading: ${isLoading}, error: ${error}`);
  return { transactions, isLoading, error, updateTransaction, refetchTransactions };
}

// Helper function to merge transactions while preserving user data
function mergeTransactionData(newTx: Transaction[], oldTx: Transaction[]): Transaction[] {
  console.log(`🔄 Merging ${newTx.length} new transactions with ${oldTx.length} existing transactions`);
  
  const result = newTx.map(tx => {
    // Find a matching transaction in the old data (by hash or other unique identifier)
    const match = oldTx.find(old => old.hash === tx.hash);
    
    if (match) {
      console.log(`🔄 Found match for transaction hash: ${tx.hash?.substring(0, 10)}...`);
      // Preserve user-edited fields
      return {
        ...tx,
        label: match.label || tx.label,
        description: match.description || tx.description
      };
    }
    
    return tx;
  });
  
  console.log(`🔄 Merge completed: ${result.length} transactions after merge`);
  return result;
} 