'use client';

import { Transaction } from '@/utils/transactionFetcher';
import { generateTransactionPDF } from '@/utils/pdfExporter';

interface PDFExportProps {
  transactions: Transaction[];
  // walletAddress is used by the PDF generator via the wallet data from localStorage
  walletBalance?: number;
  totalSent?: number;
  totalReceived?: number;
  totalGasFees?: number;
}

export default function PDFExport({ 
  transactions, 
  walletBalance, 
  totalSent, 
  totalReceived, 
  totalGasFees 
}: PDFExportProps) {
  const handleExportPDF = () => {
    generateTransactionPDF(
      transactions, 
      walletBalance, 
      totalSent, 
      totalReceived, 
      totalGasFees
    );
  };

  return (
    <div className="mt-4">
      <button
        onClick={handleExportPDF}
        disabled={!transactions || transactions.length === 0}
        className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
      >
        {!transactions || transactions.length === 0 
          ? 'No Transactions to Export' 
          : `Export ${transactions.length} Transactions as PDF`
        }
      </button>
      
      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Export your transaction data with labels and descriptions as a PDF report.
      </p>
    </div>
  );
} 