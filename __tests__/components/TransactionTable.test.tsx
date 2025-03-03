import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransactionTable from '@/components/TransactionTable';
import { Transaction } from '@/utils/transactionFetcher';

// Add jest-dom matchers type definitions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalled(): R;
      toBe(expected: any): R;
    }
  }
}

// Mock localStorageUtils
jest.mock('@/utils/localStorageUtils', () => ({
  saveTransactions: jest.fn(),
}));

// Create a test interface that extends the Transaction interface with the properties used in tests
interface TestTransaction extends Transaction {
  gasPrice?: string;
  gasUsed?: string;
  isError?: string;
  txreceipt_status?: string;
  input?: string;
  contractAddress?: string;
  confirmations?: string;
  label?: string;
  description?: string;
}

describe('TransactionTable Component', () => {
  // Sample transaction data for testing
  const mockTransactions: TestTransaction[] = [
    {
      hash: '0x123',
      date: '2023-02-28T12:30:01',
      from: '0xabc123',
      to: '0xdef456',
      value: '1000000000000000000',
      gasPrice: '50000000000',
      gasUsed: '21000',
      isError: '0',
      txreceipt_status: '1',
      input: '0x',
      contractAddress: '',
      confirmations: '12',
      label: 'Transfer',
      description: '',
    },
    {
      hash: '0x456',
      date: '2023-02-28T12:31:41',
      from: '0xdef456',
      to: '0xabc123',
      value: '500000000000000000',
      gasPrice: '40000000000',
      gasUsed: '21000',
      isError: '0',
      txreceipt_status: '1',
      input: '0x',
      contractAddress: '',
      confirmations: '10',
      label: 'Income',
      description: 'Payment received',
    }
  ];

  const mockOnTransactionsChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock local storage
    const mockLocalStorage: Record<string, string> = {};
    
    // Create proper mock functions for localStorage
    const getItemMock = jest.fn((key) => mockLocalStorage[key] || null);
    const setItemMock = jest.fn((key, value) => {
      mockLocalStorage[key] = value.toString();
    });
    
    // Apply mocks to localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: getItemMock,
        setItem: setItemMock,
      },
      writable: true
    });
  });

  it('renders the transaction table with transactions', () => {
    render(<TransactionTable 
      transactions={mockTransactions as Transaction[]} 
      onTransactionsChange={mockOnTransactionsChange}
      walletAddress="0xabc123"
    />);
    
    // Check if table headers are rendered
    expect(screen.getByText('Amount (ETH)')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
    
    // Check if ETH values are properly formatted
    expect(screen.getByText('1000000000000000000')).toBeInTheDocument();
    expect(screen.getByText('500000000000000000')).toBeInTheDocument();
  });

  it('allows editing a transaction', async () => {
    render(<TransactionTable 
      transactions={mockTransactions as Transaction[]} 
      onTransactionsChange={mockOnTransactionsChange}
      walletAddress="0xabc123"
    />);
    
    // Find and click edit button on first transaction
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    // Verify edit mode is active by looking for input fields
    const inputFields = screen.getAllByRole('textbox');
    expect(inputFields.length).toBeGreaterThan(0);
    
    // Get the label input (first textbox)
    const labelInput = inputFields[0];
    
    // Change label (previously was category)
    fireEvent.change(labelInput, { target: { value: 'Expense' } });
    
    // Add a description (second textbox)
    const descriptionInput = inputFields[1];
    fireEvent.change(descriptionInput, { target: { value: 'Test note' } });
    
    // Save changes
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    // Verify onTransactionsChange was called with updated transactions
    expect(mockOnTransactionsChange).toHaveBeenCalled();
    const updatedTransactions = mockOnTransactionsChange.mock.calls[0][0];
    expect(updatedTransactions[0].label).toBe('Expense');
    expect(updatedTransactions[0].description).toBe('Test note');
  });

  it('displays empty state when no transactions', () => {
    render(<TransactionTable 
      transactions={[]} 
      onTransactionsChange={mockOnTransactionsChange}
      walletAddress="0xabc123"
    />);
    
    expect(screen.getByText(/no transactions found/i)).toBeInTheDocument();
  });
}); 