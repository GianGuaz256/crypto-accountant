'use client';

import { ArrowUpRight, CreditCard, DollarSign, Wallet } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '../contexts/WalletContext';
import { formatCurrency } from '../../utils/formatters';
import ConnectWalletButton from '@/components/ConnectWalletButton';

export default function Dashboard() {
  const { 
    wallets, 
    totalWallets, 
    getTotalBalance, 
    getTotalTransactions
  } = useWallet();

  // All connected wallets across chains
  const allWallets = [
    ...wallets.ethereum,
    ...wallets.bitcoin,
    ...wallets.solana,
    ...wallets.tron
  ];

  // Sort wallets by balance (highest first)
  const sortedWallets = [...allWallets].sort((a, b) => b.balanceUSD - a.balanceUSD);
  // Take top 3 wallets for display
  const topWallets = sortedWallets.slice(0, 3);

  // Calculate percentage changes (mock data for now)
  const balanceChange = '+12.5%';
  const walletChange = totalWallets > 0 ? `+${totalWallets}` : '0';
  const txChange = getTotalTransactions() > 0 ? `+${getTotalTransactions()}` : '0';

  const statsCards = [
    {
      title: 'Total Balance',
      value: formatCurrency(getTotalBalance()),
      change: balanceChange,
      positive: true,
      icon: DollarSign,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Wallets',
      value: String(totalWallets),
      change: walletChange,
      positive: true,
      icon: Wallet,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Transactions',
      value: String(getTotalTransactions()),
      change: txChange,
      positive: true,
      icon: CreditCard,
      color: 'bg-green-500'
    }
  ];

  // Helper function to get blockchain info
  const getBlockchainInfo = (walletAddress: string) => {
    if (wallets.ethereum.some(w => w.address === walletAddress)) {
      return { 
        type: 'ETH', 
        color: 'blue', 
        route: 'ethereum',
        logo: '/images/ethereum.png'
      };
    }
    if (wallets.bitcoin.some(w => w.address === walletAddress)) {
      return { 
        type: 'BTC', 
        color: 'amber', 
        route: 'bitcoin',
        logo: '/images/bitcoin.png'
      };
    }
    if (wallets.solana.some(w => w.address === walletAddress)) {
      return { 
        type: 'SOL', 
        color: 'purple', 
        route: 'solana',
        logo: '/images/solana.png'
      };
    }
    if (wallets.tron.some(w => w.address === walletAddress)) {
      return { 
        type: 'TRX', 
        color: 'red', 
        route: 'tron',
        logo: '/images/tron.png'
      };
    }
    return { 
      type: 'Unknown', 
      color: 'gray', 
      route: '',
      logo: '/images/crypto-logo-placeholder.png'
    };
  };

  // Helper to format wallet address for display
  const formatAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1 dark:text-white">{stat.value}</h3>
                <div className={`flex items-center mt-1 ${stat.positive ? 'text-green-500' : 'text-red-500'}`}>
                  <span className="text-sm">{stat.change}</span>
                  <ArrowUpRight className={`h-4 w-4 ml-1 ${!stat.positive && 'transform rotate-180'}`} />
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connected Wallets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold dark:text-white">Connected Wallets</h2>
          <div className="flex items-center space-x-3">
            <ConnectWalletButton variant="outline" size="sm" iconOnly={true} />
            <Link href="/dashboard/wallets" className="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
              View All
            </Link>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          {totalWallets > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {topWallets.map((wallet) => {
                const blockchain = getBlockchainInfo(wallet.address);
                return (
                  <div key={wallet.address} className="p-4 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`h-10 w-10 rounded-full bg-${blockchain.color}-100 dark:bg-${blockchain.color}-900 flex items-center justify-center mr-3`}>
                        <Image 
                          src={blockchain.logo}
                          alt={`${blockchain.type} Logo`}
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <h3 className="font-medium dark:text-white">{wallet.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatAddress(wallet.address)}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <p className="font-semibold dark:text-white">{formatCurrency(wallet.balanceUSD)}</p>
                        <p className="text-sm text-gray-500">
                          {wallet.transactions.length} transactions
                        </p>
                      </div>
                      <Link href={`/dashboard/wallets/${blockchain.route}/${wallet.address}`} className="text-blue-500 hover:text-blue-600">
                        <ArrowUpRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No wallets connected yet</p>
              <Link href="/dashboard/wallets/ethereum" className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors inline-block">
                Connect Your First Wallet
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 