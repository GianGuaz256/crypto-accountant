'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import TransactionTable from '@/components/TransactionTable';
import AIInsights from '@/components/AIInsights';
import PDFExport from '@/components/PDFExport';
import { getWalletData, saveTransactions } from '@/utils/localStorageUtils';
import { Transaction } from '@/utils/transactionFetcher';
import { useTransactions } from '@/utils/useTransactions';
import { EtherscanStatus } from '@/components/EtherscanStatus';
import WalletSummary from '@/components/WalletSummary';
import { useWallet, BlockchainType, WalletInfo } from '../../contexts/WalletContext';

export default function TransactionsPage() {
  const { wallets, getWallet } = useWallet();
  const [wallet, setWallet] = useState<{ address: string; name: string } | null>(null);
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainType | null>(null);
  const [selectedWalletAddress, setSelectedWalletAddress] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Initialize wallet from localStorage or first available wallet in context
  useEffect(() => {
    // Check if there's a selected wallet address
    if (selectedBlockchain && selectedWalletAddress) {
      const contextWallet = getWallet(selectedBlockchain, selectedWalletAddress);
      if (contextWallet) {
        console.log('✅ Using selected wallet from context:', contextWallet.name);
        setWallet({
          address: contextWallet.address,
          name: contextWallet.name
        });
        return;
      }
    }

    // Fallback to localStorage if no wallet is selected in context
    const walletData = getWalletData();
    if (walletData) {
      console.log('✅ Wallet found in local storage:', walletData.name, 'at address:', walletData.address);
      setWallet(walletData);
      return;
    }
    
    // If no wallet in localStorage, try to use the first available wallet from context
    const blockchains: BlockchainType[] = ['ethereum', 'bitcoin', 'solana', 'tron'];
    for (const blockchain of blockchains) {
      if (wallets[blockchain].length > 0) {
        const firstWallet = wallets[blockchain][0];
        console.log(`✅ Using first available ${blockchain} wallet:`, firstWallet.name);
        setWallet({
          address: firstWallet.address,
          name: firstWallet.name
        });
        setSelectedBlockchain(blockchain);
        setSelectedWalletAddress(firstWallet.address);
        return;
      }
    }
    
    // If no wallets available at all, don't set any wallet
    console.log('❌ No wallets available');
  }, [wallets, getWallet, selectedBlockchain, selectedWalletAddress]);

  // Use our enhanced useTransactions hook
  const { 
    transactions, 
    isLoading, 
    error,
    refetchTransactions 
  } = useTransactions(wallet?.address || null);
  
  // Handle manual refetch
  const handleRefetch = () => {
    console.log('🔄 Manually triggering transaction refetch');
    refetchTransactions();
  };
  
  // Handle transaction updates
  const handleTransactionsChange = (updatedTransactions: Transaction[]) => {
    console.log('📊 Updating all transactions from TransactionTable component');
    saveTransactions(updatedTransactions);
  };

  // Toggle debug info
  const toggleDebugInfo = () => {
    setShowDebugInfo(!showDebugInfo);
  };

  // Get all available wallets from the context as a flat array
  const getAllWallets = (): Array<{wallet: WalletInfo, blockchain: BlockchainType}> => {
    const allWallets: Array<{wallet: WalletInfo, blockchain: BlockchainType}> = [];
    
    const blockchains: BlockchainType[] = ['ethereum', 'bitcoin', 'solana', 'tron'];
    for (const blockchain of blockchains) {
      wallets[blockchain].forEach(wallet => {
        allWallets.push({
          wallet,
          blockchain
        });
      });
    }
    
    return allWallets;
  };

  // Handle wallet selection change
  const handleWalletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const [blockchain, address] = e.target.value.split(':');
    if (blockchain && address) {
      setSelectedBlockchain(blockchain as BlockchainType);
      setSelectedWalletAddress(address);
      
      const selectedWallet = getWallet(blockchain as BlockchainType, address);
      if (selectedWallet) {
        setWallet({
          address: selectedWallet.address,
          name: selectedWallet.name
        });
      }
    }
  };

  // Calculate total wallets
  const totalWallets = 
    wallets.ethereum.length + 
    wallets.bitcoin.length + 
    wallets.solana.length + 
    wallets.tron.length;

  if (totalWallets === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <h2 className="text-2xl font-bold mb-4">No Wallets Connected</h2>
        <p className="mb-6 text-gray-600 dark:text-gray-400">
          Connect a wallet to view your transactions
        </p>
        <Link 
          href="/dashboard/wallets"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Connect Wallet
        </Link>
      </div>
    );
  }

  const allWallets = getAllWallets();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Transactions</h1>
            {totalWallets > 0 && (
              <div className="mt-2">
                <select
                  value={selectedBlockchain && selectedWalletAddress ? `${selectedBlockchain}:${selectedWalletAddress}` : ''}
                  onChange={handleWalletChange}
                  className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {allWallets.map(({wallet: w, blockchain}) => (
                    <option key={`${blockchain}:${w.address}`} value={`${blockchain}:${w.address}`}>
                      {w.name} - {blockchain} ({w.address.substring(0, 6)}...{w.address.substring(w.address.length - 4)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleDebugInfo}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
            <Link 
              href="/dashboard"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {showDebugInfo && wallet && (
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <div className="mb-4">
            <p><strong>Wallet Address:</strong> {wallet.address}</p>
            <p><strong>Transactions Count:</strong> {transactions.length}</p>
            <p><strong>Loading State:</strong> {isLoading ? 'Loading...' : 'Completed'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
          <EtherscanStatus />
          <div className="mt-4">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Check the browser console (F12) for more detailed logs about the transaction fetching process.
            </p>
          </div>
        </div>
      )}

      {/* Wallet Summary Section */}
      {wallet && (
        <WalletSummary 
          transactions={transactions} 
          walletAddress={wallet.address}
        />
      )}

      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transactions.length === 0 ? 'No transactions found' : `${transactions.length} transactions found`}
            {wallet && transactions.length > 0 && (
              <span className="ml-2 inline-flex items-center">
                <span className="text-xs bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full">
                  Each unique address has a distinct color and label
                </span>
              </span>
            )}
          </p>
          <button 
            onClick={handleRefetch} 
            disabled={isLoading}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Refreshing...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Transactions
              </>
            )}
          </button>
        </div>
        
        {isLoading && transactions.length === 0 ? (
          <div className="p-4 text-center">
            <p>Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-600 border border-red-300 rounded-md">
            <p>{error}</p>
            {transactions.length > 0 && (
              <p className="mt-2 text-sm">Showing cached transactions from your last session</p>
            )}
          </div>
        ) : wallet ? (
          <TransactionTable 
            transactions={transactions} 
            onTransactionsChange={handleTransactionsChange}
            walletAddress={wallet.address}
          />
        ) : (
          <div className="p-4 text-center">
            <p>Please select a wallet to view transactions</p>
          </div>
        )}
      </div>

      {wallet && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-black p-6 border rounded-lg h-full">
            <AIInsights 
              transactions={transactions}
              onTransactionsChange={handleTransactionsChange}
            />
          </div>
          
          <div className="bg-white dark:bg-black p-6 border rounded-lg h-full">
            <h2 className="text-xl font-bold mb-4">Export Report</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              Generate a PDF report of your transactions with all labels and descriptions.
            </p>
            <PDFExport transactions={transactions} />
          </div>
        </div>
      )}
    </div>
  );
} 