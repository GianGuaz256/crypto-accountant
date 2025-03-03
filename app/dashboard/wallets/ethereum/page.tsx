'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Wallet, ChevronRight, AlertTriangle, CheckCircle, Copy, Plus, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../../../contexts/WalletContext';
import { formatCurrency, formatAddress } from '../../../../utils/formatters';

export default function EthereumWalletPage() {
  const { wallets, connectWallet, isLoading } = useWallet();
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error'>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletName, setWalletName] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // Get all Ethereum wallets
  const ethereumWallets = wallets.ethereum;

  // Connect an Ethereum wallet
  const handleConnectWallet = async () => {
    setConnectionStatus('connecting');
    
    try {
      // Generate a random address for demo purposes
      const randomHex = [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
      const address = `0x${randomHex}`;
      
      // Default name if user doesn't provide one
      const name = walletName || `Ethereum Wallet ${ethereumWallets.length + 1}`;
      
      // Connect wallet using our context
      const success = await connectWallet('ethereum', address, name);
      
      if (success) {
        setWalletAddress(address);
        setConnectionStatus('success');
      } else {
        setConnectionStatus('error');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionStatus('error');
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // When wallets change, reset connection status if we just added a wallet
  useEffect(() => {
    if (connectionStatus === 'success' && walletAddress) {
      // Check if our wallet is in the list now
      const isWalletConnected = ethereumWallets.some(w => w.address === walletAddress);
      if (isWalletConnected) {
        // Reset after a few seconds
        const timer = setTimeout(() => {
          setConnectionStatus('idle');
          setWalletAddress(null);
          setWalletName('');
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [ethereumWallets, connectionStatus, walletAddress]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-8">
        <Link href="/dashboard" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Dashboard
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
        <Link href="/dashboard/wallets" className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
          Wallets
        </Link>
        <ChevronRight className="h-4 w-4 mx-2 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300">Ethereum</span>
      </div>

      {/* Connected Wallets List */}
      {ethereumWallets.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Your Ethereum Wallets</h2>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {ethereumWallets.map((wallet) => (
              <div key={wallet.address} className="py-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                    <span className="font-medium text-blue-600 dark:text-blue-300">ETH</span>
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(wallet.address)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className="font-semibold dark:text-white">{formatCurrency(wallet.balanceUSD)}</p>
                    <p className="text-sm text-green-500">+2.3% (24h)</p>
                  </div>
                  <Link href={`/dashboard/wallets/ethereum/${wallet.address}`} className="text-blue-500 hover:text-blue-600">
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <button 
              onClick={() => {
                setConnectionStatus('idle');
                setWalletAddress(null);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
              className="flex items-center text-blue-500 hover:text-blue-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Connect Another Wallet
            </button>
          </div>
        </div>
      )}

      {/* Wallet Connection Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start mb-6">
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
            <Wallet className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold dark:text-white">Connect Ethereum Wallet</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect your Ethereum wallet to track your transactions and balances.
            </p>
          </div>
        </div>

        {connectionStatus === 'success' ? (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-green-800 dark:text-green-400">Wallet Connected Successfully</h3>
                <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                  Your Ethereum wallet has been connected. You can now track your transactions and balances.
                </p>
              </div>
            </div>
          </div>
        ) : connectionStatus === 'error' ? (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-400">Connection Failed</h3>
                <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                  There was an error connecting your wallet. Please try again or try a different method.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {walletAddress && connectionStatus === 'success' ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</div>
              <button 
                onClick={() => copyToClipboard(walletAddress)}
                className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 flex items-center text-sm"
              >
                <Copy className="h-4 w-4 mr-1" />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 break-all font-mono text-sm text-gray-700 dark:text-gray-300">
              {walletAddress}
            </div>
          </div>
        ) : connectionStatus !== 'success' && (
          <div className="mb-6">
            <div className="mb-4">
              <label htmlFor="walletName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Wallet Name (Optional)
              </label>
              <input
                type="text"
                id="walletName"
                placeholder="My Ethereum Wallet"
                value={walletName}
                onChange={(e) => setWalletName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Choose one of the following methods to connect your Ethereum wallet:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={handleConnectWallet}
                disabled={isLoading || connectionStatus === 'connecting'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 mr-3">
                    <svg viewBox="0 0 784.37 1277.39" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
                      <g>
                        <polygon fill="#343434" points="392.07,0 383.5,29.11 383.5,873.74 392.07,882.29 784.13,650.54"/>
                        <polygon fill="#8C8C8C" points="392.07,0 -0,650.54 392.07,882.29 392.07,472.33"/>
                        <polygon fill="#3C3C3B" points="392.07,956.52 387.24,962.41 387.24,1263.28 392.07,1277.38 784.37,724.89"/>
                        <polygon fill="#8C8C8C" points="392.07,1277.38 392.07,956.52 0,724.89"/>
                        <polygon fill="#141414" points="392.07,882.29 784.13,650.54 392.07,472.33"/>
                        <polygon fill="#393939" points="0,650.54 392.07,882.29 392.07,472.33"/>
                      </g>
                    </svg>
                  </div>
                  <span>
                    {connectionStatus === 'connecting' || isLoading ? 'Connecting...' : 'Connect with MetaMask'}
                  </span>
                </div>
              </button>

              <button
                onClick={handleConnectWallet}
                disabled={isLoading || connectionStatus === 'connecting'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 mr-3 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    WC
                  </div>
                  <span>
                    {connectionStatus === 'connecting' || isLoading ? 'Connecting...' : 'Connect with WalletConnect'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {connectionStatus === 'success' && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white">What&apos;s Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Track your Ethereum transactions automatically</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">View detailed analytics on your wallet activity</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Export transaction history for accounting purposes</span>
              </li>
            </ul>
            <div className="mt-6">
              <Link
                href="/dashboard"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
              >
                Go to Dashboard
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Security Tips</h2>
        <ul className="space-y-3">
          <li className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Never share your private keys or seed phrases with anyone, including this application.
            </span>
          </li>
          <li className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              This application only uses read-only access to your wallet transactions. We cannot initiate transactions on your behalf.
            </span>
          </li>
          <li className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2 mt-0.5" />
            <span className="text-gray-700 dark:text-gray-300">
              Always verify the connection request details in your wallet before approving.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
} 