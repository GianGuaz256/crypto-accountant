'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { BlockchainType } from '@/app/contexts/WalletContext';
import EthereumWalletModal from './EthereumWalletModal';

interface BlockchainSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BLOCKCHAINS = [
  {
    id: 'ethereum' as BlockchainType,
    name: 'Ethereum',
    logo: '/images/ethereum.png',
    description: 'Connect to Ethereum using MetaMask, Coinbase, or WalletConnect'
  },
  {
    id: 'bitcoin' as BlockchainType,
    name: 'Bitcoin',
    logo: '/images/bitcoin.png',
    description: 'Bitcoin integration (coming soon)'
  },
  {
    id: 'solana' as BlockchainType,
    name: 'Solana',
    logo: '/images/solana.png',
    description: 'Solana integration (coming soon)'
  },
  {
    id: 'tron' as BlockchainType,
    name: 'Tron',
    logo: '/images/tron.png',
    description: 'Tron integration (coming soon)'
  }
];

export default function BlockchainSelectionModal({ isOpen, onClose }: BlockchainSelectionModalProps) {
  const [showEthereumModal, setShowEthereumModal] = useState(false);
  
  // If the modal is not open, don't render anything
  if (!isOpen) return null;
  
  const handleBlockchainSelect = (blockchain: BlockchainType) => {
    if (blockchain === 'ethereum') {
      setShowEthereumModal(true);
    } else {
      // For other blockchains, just show an alert for now
      alert(`${blockchain} integration coming soon`);
    }
  };
  
  const handleEthereumModalClose = () => {
    setShowEthereumModal(false);
  };
  
  const handleEthereumConnected = () => {
    setShowEthereumModal(false);
    onClose();
  };
  
  // If Ethereum modal is open, show it instead
  if (showEthereumModal) {
    return (
      <EthereumWalletModal 
        isOpen={showEthereumModal} 
        onClose={handleEthereumModalClose}
        onConnected={handleEthereumConnected}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-xl w-full p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-2xl font-bold mb-4 dark:text-white">Select Blockchain</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Choose a blockchain network to connect your wallet.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          {BLOCKCHAINS.map((blockchain) => (
            <button
              key={blockchain.id}
              onClick={() => handleBlockchainSelect(blockchain.id)}
              className="flex flex-col items-center p-6 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors border border-gray-200 dark:border-gray-600"
            >
              <div className="relative h-16 w-16 mb-4">
                <Image
                  src={blockchain.logo}
                  alt={blockchain.name}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <h3 className="text-lg font-medium dark:text-white">{blockchain.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                {blockchain.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
} 