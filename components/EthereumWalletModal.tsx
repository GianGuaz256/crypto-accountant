'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { useConnect } from 'wagmi';
import { injected, coinbaseWallet, walletConnect } from 'wagmi/connectors';
import { useWallet } from '@/app/contexts/WalletContext';

interface EthereumWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void;
}

const WALLET_OPTIONS = [
  {
    id: 'metamask',
    name: 'MetaMask',
    logo: '/images/metamask-logo.png',
    description: 'Connect to your MetaMask wallet',
    connector: () => injected(),
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    logo: '/images/coinbase-logo.png',
    description: 'Connect to your Coinbase wallet',
    connector: () => coinbaseWallet({ appName: 'My Crypto Accounting App' }),
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    logo: '/images/walletconnect.png',
    description: 'Connect with WalletConnect',
    connector: () => walletConnect({ 
      projectId: 'c9f3a61af260fea04c129b08eb9aff2f',
    }),
  },
];

export default function EthereumWalletModal({ isOpen, onClose, onConnected }: EthereumWalletModalProps) {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addEthereumWallet } = useWallet();
  
  const { connect, isPending } = useConnect({
    mutation: {
      onSuccess(data) {
        console.log('✅ Successfully connected to wallet', data);
        
        // Add wallet to context
        try {
          // We know accounts[0] should exist if we're successful
          const account = data.accounts[0];
          const ethWallet = {
            address: account,
            // Generate a default name based on address
            name: `ETH ${account.substring(0, 4)}...${account.substring(account.length - 4)}`,
            balance: 0,
            balanceUSD: 0,
            transactions: []
          };
          
          addEthereumWallet(ethWallet);
          onConnected();
        } catch (error) {
          console.error('Error adding wallet to context:', error);
          setError('Failed to add wallet to application');
        }
        
        setConnecting(null);
      },
      onError(error) {
        console.error('❌ Error connecting to wallet:', error);
        setError(error.message || 'Failed to connect to wallet');
        setConnecting(null);
      }
    }
  });
  
  if (!isOpen) return null;

  const handleConnectWallet = async (walletOption: typeof WALLET_OPTIONS[0]) => {
    try {
      setConnecting(walletOption.id);
      setError(null);
      
      const connector = walletOption.connector();
      connect({ connector });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error connecting to ${walletOption.name}:`, error);
      setError(`Failed to connect to ${walletOption.name}: ${errorMessage}`);
      setConnecting(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Connect Ethereum Wallet</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose a wallet provider to connect your Ethereum wallet.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-3">
          {WALLET_OPTIONS.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnectWallet(wallet)}
              disabled={isPending}
              className={`flex items-center w-full p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors 
                ${connecting === wallet.id ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'border-gray-200 dark:border-gray-700'}
                ${isPending ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              <div className="relative h-10 w-10 flex-shrink-0">
                <Image
                  src={wallet.logo}
                  alt={wallet.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div className="ml-4 flex-1 text-left">
                <h3 className="font-medium dark:text-white">{wallet.name}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{wallet.description}</p>
              </div>
              {connecting === wallet.id && (
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full ml-2"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 