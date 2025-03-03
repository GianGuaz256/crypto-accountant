import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import WalletConnect from '@/components/WalletConnect';

// Add types for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      isMetaMask: boolean;
      request: jest.Mock;
      on: jest.Mock;
      removeListener: jest.Mock;
      selectedAddress: string;
      chainId: string;
      isConnected: jest.Mock;
    };
  }
}

// Mock ethers BrowserProvider
jest.mock('ethers', () => {
  return {
    BrowserProvider: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue(undefined),
        getSigner: jest.fn().mockResolvedValue({
          getAddress: jest.fn().mockResolvedValue('0x123456789abcdef123456789abcdef123456789')
        })
      };
    })
  };
});

// Mock localStorageUtils
jest.mock('@/utils/localStorageUtils', () => ({
  saveWalletData: jest.fn()
}));

describe('WalletConnect Component', () => {
  const mockOnConnect = jest.fn();
  const originalPrompt = window.prompt;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock window.ethereum
    window.ethereum = {
      isMetaMask: true,
      request: jest.fn().mockResolvedValue(['0x123']),
      on: jest.fn(),
      removeListener: jest.fn(),
      selectedAddress: '0x123',
      chainId: '0x1',
      isConnected: jest.fn().mockReturnValue(true)
    };
    
    // Mock window.prompt
    window.prompt = jest.fn().mockReturnValue('Test Wallet');
  });

  afterEach(() => {
    // Restore original prompt
    window.prompt = originalPrompt;
  });

  it('renders the connect button', () => {
    render(<WalletConnect onConnect={mockOnConnect} />);
    
    expect(screen.getByText('Connect Your Wallet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /connect wallet/i })).toBeInTheDocument();
  });

  it('calls onConnect with the address when connection is successful', async () => {
    render(<WalletConnect onConnect={mockOnConnect} />);
    
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    
    await act(async () => {
      fireEvent.click(connectButton);
    });
    
    // Wait for the callback to be called with the full address
    await waitFor(() => {
      expect(mockOnConnect).toHaveBeenCalledWith('0x123456789abcdef123456789abcdef123456789');
    });
  });

  it('shows an error message when wallet is not available', async () => {
    // Temporarily remove ethereum from window
    const originalEthereum = window.ethereum;
    delete window.ethereum;
    
    render(<WalletConnect onConnect={mockOnConnect} />);
    
    const connectButton = screen.getByRole('button', { name: /connect wallet/i });
    
    await act(async () => {
      fireEvent.click(connectButton);
    });
    
    // Check if error text is in the document using waitFor to account for async updates
    await waitFor(() => {
      expect(screen.getByText(/no ethereum wallet detected/i)).toBeInTheDocument();
    });
    
    // Restore ethereum
    window.ethereum = originalEthereum;
  });
}); 