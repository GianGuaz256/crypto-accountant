'use client';

import React, { useState } from 'react';
import { Transaction } from '@/utils/transactionFetcher';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface WalletSummaryProps {
  transactions: Transaction[];
  walletAddress: string | null;
}

export default function WalletSummary({ transactions, walletAddress }: WalletSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // If there's no wallet address or no transactions, we can't calculate a summary
  if (!walletAddress || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Wallet Summary</h2>
        <p className="text-gray-600 dark:text-gray-400">
          No transactions available to generate a summary.
        </p>
      </div>
    );
  }

  // Calculate transaction statistics
  let totalSent = 0;
  let totalReceived = 0;
  let totalGasFees = 0;
  
  transactions.forEach(tx => {
    // Calculate sent/received amounts
    if (tx.from.toLowerCase() === walletAddress.toLowerCase()) {
      // This is an outgoing transaction
      totalSent += parseFloat(tx.value);
      
      // Add gas fees for outgoing transactions
      if (tx.gasFeesEth) {
        totalGasFees += parseFloat(tx.gasFeesEth);
      }
    }
    
    if (tx.to.toLowerCase() === walletAddress.toLowerCase()) {
      // This is an incoming transaction
      totalReceived += parseFloat(tx.value);
    }
  });
  
  // Calculate current balance (received - sent - gas fees)
  const currentBalance = totalReceived - totalSent - totalGasFees;
  
  // For transaction volume
  const transactionCount = transactions.length;
  const successfulTransactions = transactions.filter(tx => tx.status === 'Success').length;
  const failedTransactions = transactions.filter(tx => tx.status === 'Failed').length;

  // Format ETH amounts with 6 decimal places
  const formatEth = (amount: number): string => {
    return amount.toFixed(6);
  };

  // Calculate percentages for the progress bars
  const sentPercentage = Math.min(100, (totalSent / (totalSent + totalReceived)) * 100);
  const receivedPercentage = Math.min(100, (totalReceived / (totalSent + totalReceived)) * 100);
  
  return (
    <div className="bg-white dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Wallet Summary</h2>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Always show balance regardless of expanded state */}
      <div className="mb-4">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {formatEth(currentBalance)} ETH
        </div>
      </div>
      
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Based on {transactionCount} transactions
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Transaction Volume</h3>
              <div className="flex justify-between mb-1">
                <span>Total Transactions:</span>
                <span className="font-medium">{transactionCount}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span>Successful:</span>
                <span className="font-medium text-green-600 dark:text-green-400">{successfulTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed:</span>
                <span className="font-medium text-red-600 dark:text-red-400">{failedTransactions}</span>
              </div>
            </div>
          </div>
          
          <div>
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">ETH Flow</h3>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Sent:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-{formatEth(totalSent)} ETH</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-red-600 dark:bg-red-500 h-2 rounded-full" 
                    style={{ width: `${sentPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span>Received:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{formatEth(totalReceived)} ETH</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full" 
                    style={{ width: `${receivedPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>Gas Fees Paid:</span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">{formatEth(totalGasFees)} ETH</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-orange-600 dark:bg-orange-500 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, (totalGasFees / totalSent) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {((totalGasFees / totalSent) * 100).toFixed(2)}% of your sent ETH was spent on gas fees
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 