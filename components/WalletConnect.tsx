'use client';

import { useState } from 'react';
import { BrowserProvider } from 'ethers';
import { saveWalletData } from '@/utils/localStorageUtils';

interface WalletConnectProps {
  onConnect: (address: string) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Check if window.ethereum is available (MetaMask or similar)
      if (typeof window !== 'undefined' && window.ethereum) {
        const provider = new BrowserProvider(window.ethereum);
        
        // Request account access
        await provider.send('eth_requestAccounts', []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        
        // Prompt for wallet name
        const walletName = prompt('Enter a name for your wallet:') || 'My Wallet';
        
        // Save to local storage
        saveWalletData({ address, name: walletName });
        
        // Call the onConnect callback
        onConnect(address);
      } else {
        setError('No Ethereum wallet detected. Please install MetaMask or another compatible wallet.');
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      setError('Error connecting to wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white dark:bg-black border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold">Connect Your Wallet</h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
        Connect your Ethereum wallet to view and manage your transactions
      </p>
      
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>Supported wallets: MetaMask, Coinbase Wallet, WalletConnect</p>
      </div>
    </div>
  );
} 