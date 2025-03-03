'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Transaction } from '@/utils/transactionFetcher';
import { saveTransactions } from '@/utils/localStorageUtils';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onTransactionsChange?: (transactions: Transaction[]) => void;
  walletAddress?: string | null;
}

// Define a set of colors to use for different addresses
const addressColors = [
  { bg: 'bg-blue-50', bgDark: 'dark:bg-blue-900', border: 'border-blue-200', borderDark: 'dark:border-blue-700', text: 'text-blue-700', textDark: 'dark:text-blue-300' },
  { bg: 'bg-green-50', bgDark: 'dark:bg-green-900', border: 'border-green-200', borderDark: 'dark:border-green-700', text: 'text-green-700', textDark: 'dark:text-green-300' },
  { bg: 'bg-yellow-50', bgDark: 'dark:bg-yellow-900', border: 'border-yellow-200', borderDark: 'dark:border-yellow-700', text: 'text-yellow-700', textDark: 'dark:text-yellow-300' },
  { bg: 'bg-red-50', bgDark: 'dark:bg-red-900', border: 'border-red-200', borderDark: 'dark:border-red-700', text: 'text-red-700', textDark: 'dark:text-red-300' },
  { bg: 'bg-pink-50', bgDark: 'dark:bg-pink-900', border: 'border-pink-200', borderDark: 'dark:border-pink-700', text: 'text-pink-700', textDark: 'dark:text-pink-300' },
  { bg: 'bg-indigo-50', bgDark: 'dark:bg-indigo-900', border: 'border-indigo-200', borderDark: 'dark:border-indigo-700', text: 'text-indigo-700', textDark: 'dark:text-indigo-300' },
  { bg: 'bg-teal-50', bgDark: 'dark:bg-teal-900', border: 'border-teal-200', borderDark: 'dark:border-teal-700', text: 'text-teal-700', textDark: 'dark:text-teal-300' },
  { bg: 'bg-orange-50', bgDark: 'dark:bg-orange-900', border: 'border-orange-200', borderDark: 'dark:border-orange-700', text: 'text-orange-700', textDark: 'dark:text-orange-300' },
  { bg: 'bg-cyan-50', bgDark: 'dark:bg-cyan-900', border: 'border-cyan-200', borderDark: 'dark:border-cyan-700', text: 'text-cyan-700', textDark: 'dark:text-cyan-300' },
  { bg: 'bg-lime-50', bgDark: 'dark:bg-lime-900', border: 'border-lime-200', borderDark: 'dark:border-lime-700', text: 'text-lime-700', textDark: 'dark:text-lime-300' },
];

// Define common party/address nicknames
const commonAddresses: { [address: string]: { name: string, icon: string } } = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { name: 'WETH', icon: '💰' },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { name: 'USDC', icon: '💵' },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { name: 'USDT', icon: '💵' },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { name: 'DAI', icon: '💵' },
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': { name: 'Uniswap', icon: '🦄' },
  '0x7be8076f4ea4a4ad08075c2508e481d6c946d12b': { name: 'OpenSea', icon: '🌊' },
  '0x0000000000000000000000000000000000000000': { name: 'Null', icon: '⭕' },
};

// Helper to save custom address names to local storage
const saveCustomAddressNames = (customNames: Record<string, string>) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('customAddressNames', JSON.stringify(customNames));
  }
};

// Helper to get custom address names from local storage
const getCustomAddressNames = (): Record<string, string> => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('customAddressNames');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing custom address names from localStorage:', e);
      }
    }
  }
  return {};
};

export default function TransactionTable({ 
  transactions, 
  onTransactionsChange,
  walletAddress 
}: TransactionTableProps) {
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{
    label: string;
    description: string;
  }>({ label: '', description: '' });
  
  // State for editing address names in the legend
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [editAddressName, setEditAddressName] = useState('');
  const [customAddressNames, setCustomAddressNames] = useState<Record<string, string>>({});
  
  // Add state for section expansion
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Load custom address names from local storage on component mount
  useEffect(() => {
    setCustomAddressNames(getCustomAddressNames());
  }, []);

  // Create a mapping of addresses to colors and labels
  const addressMapping = useMemo(() => {
    const uniqueAddresses = new Set<string>();
    
    // Collect all unique addresses from transactions
    transactions.forEach(tx => {
      if (tx.from) uniqueAddresses.add(tx.from.toLowerCase());
      if (tx.to) uniqueAddresses.add(tx.to.toLowerCase());
    });
    
    // Create a mapping of addresses to colors and labels
    const mapping: { [address: string]: { 
      color: typeof addressColors[0], 
      name: string, 
      icon: string,
      shortAddress: string
    }} = {};
    
    let colorIndex = 0;
    
    // Add wallet address first with special purple styling
    if (walletAddress) {
      const walletLower = walletAddress.toLowerCase();
      mapping[walletLower] = {
        color: {
          bg: 'bg-purple-50', 
          bgDark: 'dark:bg-purple-900', 
          border: 'border-purple-200', 
          borderDark: 'dark:border-purple-700', 
          text: 'text-purple-700', 
          textDark: 'dark:text-purple-300'
        },
        name: customAddressNames[walletLower] || 'You',
        icon: '👤',
        shortAddress: truncateAddress(walletAddress)
      };
      uniqueAddresses.delete(walletLower);
    }
    
    // Map each remaining unique address to a color and label
    Array.from(uniqueAddresses).forEach(address => {
      const lowerAddress = address.toLowerCase();
      const knownAddress = commonAddresses[lowerAddress];
      
      // Use custom name if available, otherwise use known name or default
      const customName = customAddressNames[lowerAddress];
      const name = customName || (knownAddress?.name || `Address ${colorIndex + 1}`);
      
      mapping[lowerAddress] = {
        color: addressColors[colorIndex % addressColors.length],
        name,
        icon: knownAddress?.icon || '📍',
        shortAddress: truncateAddress(address)
      };
      
      colorIndex++;
    });
    
    return mapping;
  }, [transactions, walletAddress, customAddressNames]);

  // Handle starting to edit a transaction
  const handleEdit = (index: number, transaction: Transaction) => {
    setEditingIdx(index);
    setEditValues({
      label: transaction.label || '',
      description: transaction.description || ''
    });
  };

  // Handle saving edits to a transaction
  const handleSave = (index: number) => {
    const updatedTransactions = [...transactions];
    updatedTransactions[index] = {
      ...updatedTransactions[index],
      label: editValues.label,
      description: editValues.description
    };
    
    // Save to local storage
    saveTransactions(updatedTransactions);
    
    // Call the onTransactionsChange callback if provided
    if (onTransactionsChange) {
      onTransactionsChange(updatedTransactions);
    }
    
    // Reset editing state
    setEditingIdx(-1);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditValues(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle starting to edit an address name
  const handleStartAddressEdit = (address: string) => {
    setEditingAddress(address);
    setEditAddressName(customAddressNames[address.toLowerCase()] || '');
  };
  
  // Handle saving edited address name
  const handleSaveAddressName = () => {
    if (!editingAddress) return;
    
    const updatedNames = { ...customAddressNames, [editingAddress.toLowerCase()]: editAddressName };
    setCustomAddressNames(updatedNames);
    saveCustomAddressNames(updatedNames);
    setEditingAddress(null);
  };
  
  // Handle canceling address name edit
  const handleCancelAddressEdit = () => {
    setEditingAddress(null);
  };

  // Function to check if an address matches the connected wallet (case-insensitive)
  const isWalletAddress = (address: string): boolean => {
    if (!walletAddress || !address) return false;
    return address.toLowerCase() === walletAddress.toLowerCase();
  };

  // Add a state for expanded transaction details
  const [expandedTx, setExpandedTx] = useState<string | null>(null);
  
  // Toggle expanded transaction details
  const toggleExpandTx = (hash: string | undefined) => {
    if (!hash) return;
    setExpandedTx(expandedTx === hash ? null : hash);
  };

  // If no transactions are available
  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md bg-gray-50 dark:bg-gray-900">
        <p>No transactions found. Connect your wallet to view your transactions.</p>
      </div>
    );
  }

  // Render an address with consistent styling
  const renderAddress = (address: string, nameTag?: string) => {
    if (!address) return <span>-</span>;
    
    const addressLower = address.toLowerCase();
    const addressInfo = addressMapping[addressLower];
    
    if (!addressInfo) return <span>{truncateAddress(address)}</span>;
    
    const { color, name, icon, shortAddress } = addressInfo;
    
    // Use the provided nameTag or fall back to the local name
    const displayName = nameTag || name;
    
    return (
      <div className="flex flex-col items-start">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1 flex items-center">
          <span className="mr-1">{icon}</span>
          <span>{displayName}</span>
        </div>
        <span className={`inline-flex items-center ${color.bg} ${color.bgDark} border ${color.border} ${color.borderDark} ${color.text} ${color.textDark} rounded-full px-3 py-1 font-bold`}>
          {shortAddress}
          {isWalletAddress(address) && (
            <span className="ml-1 text-xs text-purple-600 dark:text-purple-400">(You)</span>
          )}
        </span>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <div className="mr-2 w-6 h-6">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="w-full h-full">
              <path d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z" fill="currentColor"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold">Ethereum Transaction</h2>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>
      
      {isExpanded && (
        <>
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm font-medium">Address Legend:</p>
              <p className="text-xs text-gray-500 italic">Double-click any label to edit its name</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(addressMapping).map(([address, info]) => (
                <div key={address} className="flex items-center mb-2">
                  {editingAddress === address ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={editAddressName}
                        onChange={(e) => setEditAddressName(e.target.value)}
                        autoFocus
                        className={`px-2 py-0.5 text-xs rounded mr-1 w-32 border ${info.color.border} ${info.color.borderDark} ${info.color.text} ${info.color.textDark} focus:ring-2 focus:ring-opacity-50 focus:ring-${info.color.border.replace('border-', '')}`}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveAddressName()}
                      />
                      <button 
                        onClick={handleSaveAddressName}
                        className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 mr-1 ${info.color.bg} ${info.color.bgDark} border ${info.color.border} ${info.color.borderDark} ${info.color.text} ${info.color.textDark}`}
                      >
                        Save
                      </button>
                      <button 
                        onClick={handleCancelAddressEdit}
                        className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 bg-white dark:bg-gray-800 border ${info.color.border} ${info.color.borderDark} ${info.color.text} ${info.color.textDark}`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span 
                      className={`inline-flex items-center ${info.color.bg} ${info.color.bgDark} border ${info.color.border} ${info.color.borderDark} ${info.color.text} ${info.color.textDark} rounded-full px-2 py-0.5 text-xs font-medium cursor-pointer`}
                      onDoubleClick={() => handleStartAddressEdit(address)}
                      title="Double-click to edit name"
                    >
                      <span className="mr-1">{info.icon}</span>
                      {info.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Date</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">From</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">To</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Value (ETH)</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Gas (ETH)</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Status</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Type</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Method</th>
                <th className="px-3 py-2 border-b border-gray-200 dark:border-gray-700 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx, index) => {
                const isExpanded = expandedTx === tx.hash;
                const isEditing = editingIdx === index;
                return (
                  <React.Fragment key={index}>
                    <tr className={`border-b border-gray-200 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-gray-900'}`}>
                      <td className="px-3 py-2 text-xs">{tx.date}</td>
                      <td className="px-3 py-2 text-xs">
                        {renderAddress(tx.from, tx.fromName)}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {renderAddress(tx.to, tx.toName)}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono">
                        {parseFloat(tx.value).toFixed(6)}
                      </td>
                      <td className="px-3 py-2 text-xs font-mono">
                        {tx.gasFeesEth ? parseFloat(tx.gasFeesEth).toFixed(6) : 'N/A'}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-2xs ${
                          tx.status === 'Success' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {tx.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <span className={`px-1.5 py-0.5 inline-flex text-2xs leading-4 font-semibold rounded-full
                          ${tx.transactionType === 'normal' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : tx.transactionType === 'contractCreation'
                                  ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {tx.transactionType === 'normal' 
                            ? 'Transfer' 
                            : tx.transactionType === 'contractCreation'
                                ? 'Contract Creation'
                                : 'Contract Call'}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs">
                        {tx.methodName ? (
                          <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-full text-2xs font-medium">
                            {tx.methodName}
                          </span>
                        ) : tx.methodId ? (
                          <span className="text-2xs font-mono text-gray-500">{tx.methodId}</span>
                        ) : (
                          <span className="text-2xs text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex gap-1">
                          {isEditing ? (
                            <React.Fragment>
                              <button
                                onClick={() => handleSave(index)}
                                className="p-0.5 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                                aria-label="Save changes"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setEditingIdx(-1)}
                                className="p-0.5 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                aria-label="Cancel edit"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </React.Fragment>
                          ) : (
                            <React.Fragment>
                              <button
                                onClick={() => toggleExpandTx(tx.hash)}
                                className={`p-0.5 ${isExpanded ? 'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300' : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300'}`}
                                aria-label={isExpanded ? 'Show less' : 'Show more'}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isExpanded ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleEdit(index, tx)}
                                className="p-0.5 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                                aria-label="Edit transaction"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </React.Fragment>
                          )}
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <td colSpan={9} className="px-4 py-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">Transaction Hash</h4>
                              <a 
                                href={`https://etherscan.io/tx/${tx.hash}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400 break-all text-xs"
                              >
                                {tx.hash}
                              </a>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">Block Number</h4>
                              <a 
                                href={`https://etherscan.io/block/${tx.blockNumber}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline dark:text-blue-400 text-xs"
                              >
                                {tx.blockNumber}
                              </a>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">From</h4>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={`https://etherscan.io/address/${tx.from}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline dark:text-blue-400 break-all text-xs"
                                >
                                  {tx.from}
                                </a>
                                {tx.fromName && (
                                  <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                                    {tx.fromName}
                                  </span>
                                )}
                                {editingAddress === tx.from && (
                                  <div className="flex gap-1 mt-1">
                                    <input 
                                      type="text" 
                                      value={editAddressName} 
                                      onChange={(e) => setEditAddressName(e.target.value)} 
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      placeholder="Enter a name" 
                                    />
                                    <button onClick={handleSaveAddressName} className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs">Save</button>
                                    <button onClick={handleCancelAddressEdit} className="bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded text-xs">Cancel</button>
                                  </div>
                                )}
                                {!editingAddress && (
                                  <button 
                                    onClick={() => handleStartAddressEdit(tx.from)} 
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  >
                                    {customAddressNames[tx.from.toLowerCase()] ? 'Edit' : 'Add name'}
                                  </button>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">To</h4>
                              <div className="flex items-center gap-2">
                                <a 
                                  href={`https://etherscan.io/address/${tx.to}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline dark:text-blue-400 break-all text-xs"
                                >
                                  {tx.to}
                                </a>
                                {tx.toName && (
                                  <span className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">
                                    {tx.toName}
                                  </span>
                                )}
                                {editingAddress === tx.to && (
                                  <div className="flex gap-1 mt-1">
                                    <input 
                                      type="text" 
                                      value={editAddressName} 
                                      onChange={(e) => setEditAddressName(e.target.value)} 
                                      className="px-1.5 py-0.5 border rounded text-xs"
                                      placeholder="Enter a name" 
                                    />
                                    <button onClick={handleSaveAddressName} className="bg-green-500 text-white px-1.5 py-0.5 rounded text-xs">Save</button>
                                    <button onClick={handleCancelAddressEdit} className="bg-gray-300 text-gray-800 px-1.5 py-0.5 rounded text-xs">Cancel</button>
                                  </div>
                                )}
                                {!editingAddress && tx.to && (
                                  <button 
                                    onClick={() => handleStartAddressEdit(tx.to)} 
                                    className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                                  >
                                    {customAddressNames[tx.to?.toLowerCase()] ? 'Edit' : 'Add name'}
                                  </button>
                                )}
                              </div>
                            </div>
                            {tx.methodName && (
                              <div>
                                <h4 className="font-semibold mb-1 text-sm">Method</h4>
                                <div className="flex items-center">
                                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 rounded-lg font-medium text-xs">
                                    {tx.methodName}
                                  </span>
                                  {tx.methodId && (
                                    <span className="ml-2 text-xs font-mono text-gray-500">
                                      {tx.methodId}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">Value</h4>
                              <p className="font-mono text-xs">{parseFloat(tx.value).toFixed(8)} ETH</p>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1 text-sm">Transaction Fee</h4>
                              <p className="font-mono text-xs">{tx.gasFeesEth ? parseFloat(tx.gasFeesEth).toFixed(8) : 'N/A'} ETH</p>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                              <h4 className="font-semibold mb-1 text-sm">Description</h4>
                              {isEditing ? (
                                <textarea
                                  name="description"
                                  value={editValues.description}
                                  onChange={handleInputChange}
                                  rows={3}
                                  className="w-full p-2 border rounded text-xs"
                                  placeholder="Enter description"
                                />
                              ) : (
                                <p className="whitespace-pre-wrap break-all text-xs">
                                  {tx.description || 'No description provided'}
                                </p>
                              )}
                            </div>

                            {isEditing && (
                              <div className="col-span-1 md:col-span-2">
                                <h4 className="font-semibold mb-1 text-sm">Label</h4>
                                <input
                                  type="text"
                                  name="label"
                                  value={editValues.label}
                                  onChange={handleInputChange}
                                  className="w-full p-2 border rounded text-xs"
                                  placeholder="Enter label"
                                />
                              </div>
                            )}

                            {tx.input && tx.input !== '0x' && (
                              <div className="col-span-1 md:col-span-2">
                                <h4 className="font-semibold mb-1 text-sm">Input Data</h4>
                                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded font-mono text-xs overflow-x-auto">
                                  {tx.input}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                    {isEditing && !isExpanded && (
                      <tr className="bg-gray-50 dark:bg-gray-900">
                        <td colSpan={9} className="px-4 py-2">
                          <div className="space-y-3">
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Edit Label</h4>
                              <input
                                type="text"
                                name="label"
                                value={editValues.label}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded text-xs"
                                placeholder="Enter transaction label"
                              />
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">Edit Description</h4>
                              <textarea
                                name="description"
                                value={editValues.description}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full p-2 border rounded text-xs"
                                placeholder="Enter transaction description"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

// Helper function to truncate Ethereum addresses for display
function truncateAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
} 