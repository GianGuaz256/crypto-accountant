'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, AlertTriangle, CheckCircle, Copy } from 'lucide-react';
import { toast } from 'sonner';

export default function BitcoinWalletPage() {
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'success' | 'error' | 'waiting'>('idle');
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Mock function to connect a Bitcoin wallet
  const connectWallet = async () => {
    setIsConnecting(true);
    setConnectionStatus('connecting');
    
    try {
      // In a real app, this would connect to a real Bitcoin wallet
      // For now, we'll just clear any previous mock data
      setWalletAddress('');
      setConnectionStatus('waiting');
      
      // Inform the user they need to connect a real wallet
      toast.info('Please connect a real Bitcoin wallet. This feature is not yet implemented.');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setConnectionStatus('error');
      
      toast.error('Failed to connect to wallet. Please try again.');
    } finally {
      setIsConnecting(false);
    }
  };

  // Copy wallet address to clipboard
  const copyToClipboard = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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
        <span className="text-gray-700 dark:text-gray-300">Bitcoin</span>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
        <div className="flex items-start mb-6">
          <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mr-4">
            <span className="text-xl font-medium text-amber-600 dark:text-amber-400">₿</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold dark:text-white">Bitcoin Wallet Connection</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Connect your Bitcoin wallet to track your transactions and balances.
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
                  Your Bitcoin wallet has been connected. You can now track your transactions and balances.
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

        {walletAddress ? (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</div>
              <button 
                onClick={copyToClipboard}
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
        ) : (
          <div className="mb-6">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Choose one of the following methods to connect your Bitcoin wallet:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={connectWallet}
                disabled={isConnecting || connectionStatus === 'success'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 mr-3 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                    <span className="text-lg font-medium text-amber-600 dark:text-amber-400">₿</span>
                  </div>
                  <span>
                    {isConnecting ? 'Connecting...' : 'Connect Bitcoin Wallet'}
                  </span>
                </div>
              </button>

              <button
                onClick={connectWallet}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center justify-center px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <div className="flex items-center">
                  <div className="h-8 w-8 mr-3 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    WC
                  </div>
                  <span>
                    {connectionStatus === 'connecting' ? 'Connecting...' : 'Use WalletConnect'}
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {walletAddress && (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white">What&apos;s Next?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                <span className="text-gray-700 dark:text-gray-300">Track your Bitcoin transactions automatically</span>
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

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Bitcoin Security Tips</h2>
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
              Consider using a hardware wallet for maximum security of your Bitcoin assets.
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