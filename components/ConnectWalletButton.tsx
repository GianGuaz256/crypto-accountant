'use client';

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import BlockchainSelectionModal from './BlockchainSelectionModal';

interface ConnectWalletButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  iconOnly?: boolean;
}

export default function ConnectWalletButton({ 
  variant = 'primary', 
  size = 'md',
  className = '',
  iconOnly = false
}: ConnectWalletButtonProps) {
  const [showModal, setShowModal] = useState(false);
  
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  
  // Styles based on variant and size
  const variantStyles = {
    default: 'bg-gray-200 hover:bg-gray-300 text-gray-900 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100',
    outline: 'border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100',
    secondary: 'bg-purple-600 hover:bg-purple-700 text-white',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };
  
  const sizeStyles = {
    sm: iconOnly ? 'p-1' : 'text-sm px-2 py-1',
    md: iconOnly ? 'p-2' : 'px-4 py-2',
    lg: iconOnly ? 'p-3' : 'text-lg px-6 py-3',
  };
  
  return (
    <>
      <button 
        onClick={openModal}
        className={`flex items-center ${!iconOnly ? 'gap-2' : ''} rounded-md transition-colors ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        title={iconOnly ? "Connect Wallet" : undefined}
        aria-label="Connect Wallet"
      >
        <Wallet size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />
        {!iconOnly && <span>Connect Wallet</span>}
      </button>
      
      <BlockchainSelectionModal isOpen={showModal} onClose={closeModal} />
    </>
  );
} 