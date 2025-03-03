'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Plus, ArrowUpRight } from 'lucide-react';
import { useWallet } from '../../contexts/WalletContext';
import { formatCurrency, formatAddress } from '../../../utils/formatters';

export default function WalletsPage() {
  const { wallets } = useWallet();
  
  // Flatten wallets from all blockchains to display them
  const allWallets = [
    ...wallets.ethereum.map(w => ({ ...w, blockchain: 'ethereum', symbol: 'ETH', color: 'blue' })),
    ...wallets.bitcoin.map(w => ({ ...w, blockchain: 'bitcoin', symbol: 'BTC', color: 'amber' })),
    ...wallets.solana.map(w => ({ ...w, blockchain: 'solana', symbol: 'SOL', color: 'purple' })),
    ...wallets.tron.map(w => ({ ...w, blockchain: 'tron', symbol: 'TRX', color: 'red' })),
  ];

  // Sort wallets by balance (highest first)
  const sortedWallets = [...allWallets].sort((a, b) => b.balanceUSD - a.balanceUSD);

  // Blockchains with connection status
  const blockchains = [
    { 
      id: 'ethereum', 
      name: 'Ethereum', 
      logo: '/images/ethereum-logo.png',
      active: wallets.ethereum.length > 0,
      count: wallets.ethereum.length
    },
    { 
      id: 'bitcoin', 
      name: 'Bitcoin', 
      logo: '/images/bitcoin-logo.png',
      active: wallets.bitcoin.length > 0,
      count: wallets.bitcoin.length
    },
    { 
      id: 'tron', 
      name: 'Tron', 
      logo: '/images/tron-logo.png',
      active: wallets.tron.length > 0,
      count: wallets.tron.length
    },
    { 
      id: 'solana', 
      name: 'Solana', 
      logo: '/images/solana-logo.png',
      active: wallets.solana.length > 0,
      count: wallets.solana.length
    },
  ];

  return (
    <div className="space-y-8">
      {/* Connected Wallets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-white">Connected Wallets</h2>
        </div>

        {sortedWallets.length > 0 ? (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedWallets.map((wallet) => (
              <div key={wallet.address} className="p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-10 w-10 rounded-full bg-${wallet.color}-100 dark:bg-${wallet.color}-900 flex items-center justify-center mr-3`}>
                    <span className={`font-medium text-${wallet.color}-600 dark:text-${wallet.color}-300`}>
                      {wallet.symbol}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium dark:text-white">{wallet.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(wallet.address)}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="text-right mr-4">
                    <p className="font-semibold dark:text-white">{formatCurrency(wallet.balanceUSD)}</p>
                    <p className="text-sm text-green-500">
                      +2.3%
                    </p>
                  </div>
                  <Link href={`/dashboard/wallets/${wallet.blockchain}/${wallet.address}`} className="text-blue-500 hover:text-blue-600">
                    <ArrowUpRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">No wallets connected yet</p>
          </div>
        )}
      </div>

      {/* Available Blockchains */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold dark:text-white">Available Blockchains</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Connect to different blockchain networks to track your assets.
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {blockchains.map((blockchain) => (
            <div key={blockchain.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4">
                  <Image 
                    src={blockchain.logo}
                    alt={`${blockchain.name} Logo`}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium dark:text-white">{blockchain.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {blockchain.active 
                      ? `${blockchain.count} wallet${blockchain.count > 1 ? 's' : ''} connected` 
                      : 'Not connected'}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <Link 
                  href={`/dashboard/wallets/${blockchain.id}`} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {blockchain.active ? 'Manage' : 'Connect'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden p-6">
        <h2 className="text-xl font-semibold mb-4 dark:text-white">Wallet Connection Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                1
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Choose Your Blockchain</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select the blockchain network where your assets are stored.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                2
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Connect Your Wallet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Use browser extensions like MetaMask or mobile wallets via WalletConnect.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                3
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Approve Read Access</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Grant read-only permission for your wallet balance and transaction history.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 mr-3">
                4
              </div>
              <div>
                <h3 className="font-medium dark:text-white">Track Your Assets</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View your balance, transactions, and generate reports for accounting.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 