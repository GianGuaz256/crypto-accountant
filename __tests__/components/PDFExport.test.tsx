import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PDFExport from '@/components/PDFExport';
import { Transaction } from '@/utils/transactionFetcher';
import { generateTransactionPDF } from '@/utils/pdfExporter';

// Add jest-dom matchers type definitions
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalledWith(expected: any): R;
    }
  }
}

// Mock the PDF exporter functionality
jest.mock('@/utils/pdfExporter', () => ({
  generateTransactionPDF: jest.fn()
}));

describe('PDFExport Component', () => {
  // Sample transaction data for testing
  const mockTransactions: Transaction[] = [
    {
      hash: '0x123',
      date: '2023-02-28T12:30:01',
      from: '0xabc123',
      to: '0xdef456',
      value: '1000000000000000000',
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the export button', () => {
    render(
      <PDFExport 
        transactions={mockTransactions}
      />
    );
    
    expect(screen.getByRole('button', { name: /export.*pdf/i })).toBeInTheDocument();
  });

  it('triggers PDF generation when button is clicked', () => {
    render(
      <PDFExport 
        transactions={mockTransactions}
      />
    );
    
    const exportButton = screen.getByRole('button', { name: /export.*pdf/i });
    fireEvent.click(exportButton);
    
    // Verify PDF generation was called
    expect(generateTransactionPDF).toHaveBeenCalledWith(mockTransactions);
  });

  it('handles empty transactions array', () => {
    render(
      <PDFExport 
        transactions={[]}
      />
    );
    
    expect(screen.getByText(/no transactions to export/i)).toBeInTheDocument();
  });
}); 