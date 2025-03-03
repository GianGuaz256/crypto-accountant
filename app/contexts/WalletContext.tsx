'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type BlockchainType = 'ethereum' | 'bitcoin' | 'solana' | 'tron';

export interface WalletInfo {
  address: string;
  name: string;
  balance: number; // In crypto units
  balanceUSD: number; // USD value
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap';
  amount: string;
  value: string;
  to?: string;
  from?: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Failed';
}

interface PriceData {
  ethereum: number;
  bitcoin: number;
  solana: number;
  tron: number;
  usdc: number;
  [key: string]: number; // Allow additional keys for future tokens
}

interface WalletContextType {
  // Wallet management
  wallets: {
    ethereum: WalletInfo[];
    bitcoin: WalletInfo[];
    solana: WalletInfo[];
    tron: WalletInfo[];
  };
  totalWallets: number;
  getTotalBalance: () => number;
  
  // Wallet functions
  connectWallet: (blockchain: BlockchainType, address: string, name: string) => Promise<boolean>;
  disconnectWallet: (blockchain: BlockchainType, address: string) => void;
  getWallet: (blockchain: BlockchainType, address: string) => WalletInfo | undefined;
  getTotalTransactions: () => number;
  
  // Ethereum-specific functions for Wagmi integration
  addEthereumWallet: (wallet: WalletInfo) => void;
  
  // Prices
  prices: PriceData;
  isLoading: boolean;
}

// Create context with default values
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Placeholder for real price data integration
const DEFAULT_PRICES: PriceData = {
  ethereum: 0,
  bitcoin: 0,
  solana: 0,
  tron: 0,
  usdc: 0,
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [wallets, setWallets] = useState<{
    ethereum: WalletInfo[];
    bitcoin: WalletInfo[];
    solana: WalletInfo[];
    tron: WalletInfo[];
  }>({
    ethereum: [],
    bitcoin: [],
    solana: [],
    tron: [],
  });
  const [prices, setPrices] = useState<PriceData>(DEFAULT_PRICES);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Calculate total wallets
  const totalWallets = wallets.ethereum.length + wallets.bitcoin.length + wallets.solana.length + wallets.tron.length;

  // Get total balance in USD across all wallets
  const getTotalBalance = (): number => {
    let total = 0;
    
    // Sum Ethereum wallets
    total += wallets.ethereum.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);
    
    // Sum Bitcoin wallets
    total += wallets.bitcoin.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);
    
    // Sum Solana wallets
    total += wallets.solana.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);
    
    // Sum Tron wallets
    total += wallets.tron.reduce((sum, wallet) => sum + wallet.balanceUSD, 0);
    
    return total;
  };

  // Get total number of transactions across all wallets
  const getTotalTransactions = (): number => {
    let total = 0;
    
    // Count Ethereum transactions
    total += wallets.ethereum.reduce((sum, wallet) => sum + wallet.transactions.length, 0);
    
    // Count Bitcoin transactions
    total += wallets.bitcoin.reduce((sum, wallet) => sum + wallet.transactions.length, 0);
    
    // Count Solana transactions
    total += wallets.solana.reduce((sum, wallet) => sum + wallet.transactions.length, 0);
    
    // Count Tron transactions
    total += wallets.tron.reduce((sum, wallet) => sum + wallet.transactions.length, 0);
    
    return total;
  };

  // Connect a new wallet
  const connectWallet = async (blockchain: BlockchainType, address: string, name: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Check if wallet already exists
      const existingWallet = wallets[blockchain].find(w => w.address === address);
      if (existingWallet) {
        setIsLoading(false);
        return false;
      }
      
      // In a real implementation, this would call an API to get the wallet balance and transactions
      // For now, we're creating an empty wallet that would be populated with real data later
      
      // Create new wallet with empty data
      const newWallet: WalletInfo = {
        address,
        name,
        balance: 0,
        balanceUSD: 0,
        transactions: [],
      };
      
      // Update wallets state
      setWallets(prev => ({
        ...prev,
        [blockchain]: [...prev[blockchain], newWallet],
      }));
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setIsLoading(false);
      return false;
    }
  };

  // Disconnect a wallet
  const disconnectWallet = (blockchain: BlockchainType, address: string): void => {
    setWallets(prev => ({
      ...prev,
      [blockchain]: prev[blockchain].filter(wallet => wallet.address !== address),
    }));
  };

  // Get a specific wallet
  const getWallet = (blockchain: BlockchainType, address: string): WalletInfo | undefined => {
    return wallets[blockchain].find(wallet => wallet.address === address);
  };

  // Mock fetching prices - would be replaced with real API call
  useEffect(() => {
    const fetchPrices = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Add some price fluctuation on each load for realism
        const updatedPrices = { ...DEFAULT_PRICES };
        Object.keys(updatedPrices).forEach(key => {
          const fluctuation = (Math.random() * 0.1) - 0.05; // -5% to +5%
          updatedPrices[key as keyof PriceData] = DEFAULT_PRICES[key as keyof PriceData] * (1 + fluctuation);
        });
        
        setPrices(updatedPrices);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setIsLoading(false);
      }
    };

    fetchPrices();
    
    // Refresh prices every 60 seconds
    const intervalId = setInterval(fetchPrices, 60000);
    return () => clearInterval(intervalId);
  }, []);

  // Ethereum-specific functions for Wagmi integration
  const addEthereumWallet = (wallet: WalletInfo) => {
    // Check if wallet already exists
    const existingWallet = wallets.ethereum.find(w => w.address.toLowerCase() === wallet.address.toLowerCase());
    if (existingWallet) {
      console.log('Wallet already exists, not adding again');
      return;
    }
    
    // Add wallet to ethereum wallets
    setWallets(prev => ({
      ...prev,
      ethereum: [...prev.ethereum, wallet]
    }));
    
    console.log(`Added Ethereum wallet: ${wallet.name} (${wallet.address})`);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('wallets', JSON.stringify({
        ...wallets,
        ethereum: [...wallets.ethereum, wallet]
      }));
    }
  };

  return (
    <WalletContext.Provider
      value={{
        wallets,
        totalWallets,
        getTotalBalance,
        connectWallet,
        disconnectWallet,
        getWallet,
        getTotalTransactions,
        prices,
        isLoading,
        addEthereumWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

// Custom hook to use the wallet context
export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}; 