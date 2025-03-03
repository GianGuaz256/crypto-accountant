import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EtherscanStatus } from '@/components/EtherscanStatus';

// Mock axios to prevent actual API calls
jest.mock('axios', () => ({
  get: jest.fn().mockImplementation(() => 
    Promise.resolve({
      data: {
        status: '1',
        result: '123456789',
        message: 'OK'
      }
    })
  )
}));

// Add type definitions for jest-dom matchers
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
  }
}

describe('EtherscanStatus Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('displays etherscan API status header', async () => {
    await act(async () => {
      render(<EtherscanStatus />);
    });
    
    expect(screen.getByText(/etherscan api status/i)).toBeInTheDocument();
  });

  it('renders connected state after API call', async () => {
    await act(async () => {
      render(<EtherscanStatus />);
    });
    
    // Wait for the component to update after the API call
    await waitFor(() => {
      expect(screen.getByText(/connected to etherscan api successfully/i)).toBeInTheDocument();
    });
    
    expect(screen.getByText(/received eth balance/i)).toBeInTheDocument();
  });

  it('renders with custom props - loading state', () => {
    render(
      <EtherscanStatus 
        isLoading={true} 
        message="Loading transactions..." 
        details="" 
        status="checking" 
        error={null} 
      />
    );
    
    expect(screen.getByText(/loading transactions/i)).toBeInTheDocument();
  });

  it('renders with custom props - error state', () => {
    const errorMessage = "API rate limit exceeded";
    
    render(
      <EtherscanStatus 
        isLoading={false} 
        message={errorMessage} 
        details="Please try again later" 
        status="error" 
        error={errorMessage} 
      />
    );
    
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('renders with custom props - success state', () => {
    render(
      <EtherscanStatus 
        isLoading={false} 
        message="Transactions loaded successfully" 
        details="Found 10 transactions" 
        status="connected" 
        error={null} 
      />
    );
    
    expect(screen.getByText(/transactions loaded successfully/i)).toBeInTheDocument();
  });
}); 