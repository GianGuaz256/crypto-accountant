'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import TransactionTable from '@/components/TransactionTable';
import AIInsights from '@/components/AIInsights';
import PDFExport from '@/components/PDFExport';
import { saveTransactions } from '@/utils/localStorageUtils';
import { Transaction } from '@/utils/transactionFetcher';
import { useTransactions } from '@/utils/useTransactions';
import { EtherscanStatus } from '@/components/EtherscanStatus';
import WalletSummary from '@/components/WalletSummary';
import { useWallet } from '../../../../contexts/WalletContext';

export default function BitcoinWalletDetailPage() {
  const { wallets } = useWallet();
  const params = useParams();
  const address = params.address as string;
  
  // Find the wallet info based on address
  const wallet = wallets.bitcoin.find(w => w.address === address);
  
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Use our enhanced useTransactions hook with the specific wallet address
  const { 
    transactions, 
    isLoading, 
    error,
    refetchTransactions 
  } = useTransactions(address);
  
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

  // If wallet not found
  if (!wallet) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-8">
          <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Dashboard
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
          <Link href="/dashboard/wallets" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Wallets
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
          <Link href="/dashboard/wallets/bitcoin" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
            Bitcoin
          </Link>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <h2 className="text-xl font-semibold mb-2 dark:text-white">Wallet Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            The Bitcoin wallet with address {address} could not be found.
          </p>
          <Link 
            href="/dashboard/wallets/bitcoin"
            className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Bitcoin Wallets
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
        <Link href="/dashboard/wallets" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Wallets
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
        <Link href="/dashboard/wallets/bitcoin" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Bitcoin
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{wallet.name}</span>
      </div>

      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Bitcoin Wallet: {wallet.name}</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mt-1">
              {address}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={toggleDebugInfo}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
            >
              {showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
            </button>
            <Link 
              href="/dashboard/wallets/bitcoin"
              className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              Back to Bitcoin Wallets
            </Link>
          </div>
        </div>
      </header>

      {showDebugInfo && (
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Debug Information</h2>
          <div className="mb-4">
            <p><strong>Wallet Address:</strong> {address}</p>
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
      <WalletSummary 
        transactions={transactions} 
        walletAddress={address}
      />

      <div className="my-8">
        <h2 className="text-2xl font-bold mb-4">Transactions</h2>
        
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {transactions.length === 0 ? 'No transactions found' : `${transactions.length} transactions found`}
            {transactions.length > 0 && (
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
        ) : (
          <TransactionTable 
            transactions={transactions} 
            onTransactionsChange={handleTransactionsChange}
            walletAddress={address}
          />
        )}
      </div>

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
            Generate a PDF report of your Bitcoin transactions with all labels and descriptions.
          </p>
          <PDFExport transactions={transactions} />
        </div>
      </div>
    </div>
  );
} 