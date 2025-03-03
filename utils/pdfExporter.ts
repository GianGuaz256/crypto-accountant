import jsPDF from 'jspdf';
import { Transaction } from './transactionFetcher';
import { getWalletData } from './localStorageUtils';

// Import jspdf-autotable directly
import autoTable from 'jspdf-autotable';

export function generateTransactionPDF(
  transactions: Transaction[], 
  walletBalance?: number, 
  totalSent?: number, 
  totalReceived?: number, 
  totalGasFees?: number
): void {
  // Create a new jsPDF instance
  const doc = new jsPDF();
  
  // Get wallet information
  const wallet = getWalletData();
  const walletName = wallet?.name || 'Unnamed Wallet';
  const walletAddress = wallet?.address || 'No address';
  
  // Add title
  doc.setFontSize(18);
  doc.text('Crypto Transaction Report', 105, 15, { align: 'center' });
  
  // Add wallet information
  doc.setFontSize(12);
  doc.text(`Wallet: ${walletName}`, 14, 25);
  doc.text(`Address: ${truncateAddress(walletAddress)}`, 14, 32);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 39);
  
  // Add transaction count
  doc.text(`Total Transactions: ${transactions.length}`, 14, 46);

  // Add wallet summary box if available
  if (typeof walletBalance !== 'undefined') {
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(14, 50, 182, 35, 3, 3, 'FD');
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Wallet Summary', 20, 60);
    
    doc.setFontSize(10);
    doc.text(`Current Balance: ${walletBalance.toFixed(6)} ETH`, 20, 70);
    doc.text(`Total Sent: ${totalSent?.toFixed(6) || '0'} ETH`, 80, 70);
    doc.text(`Total Received: ${totalReceived?.toFixed(6) || '0'} ETH`, 140, 70);
    doc.text(`Total Gas Fees: ${totalGasFees?.toFixed(6) || '0'} ETH`, 80, 80);
    
    // Add horizontal line
    doc.line(14, 90, 196, 90);
  } else {
    // Add horizontal line
    doc.line(14, 50, 196, 50);
  }

  // Prepare data for the table
  const tableData = transactions.map(tx => {
    const isOutgoing = wallet && wallet.address 
      ? tx.from.toLowerCase() === wallet.address.toLowerCase() 
      : false;
      
    return [
      tx.date,
      truncateAddress(tx.from),
      truncateAddress(tx.to),
      `${parseFloat(tx.value).toFixed(6)} ETH`,
      isOutgoing ? 'Out' : 'In',
      tx.label || '',
      tx.description || ''
    ];
  });
  
  // Use the standalone autoTable function instead of calling it as a method on doc
  autoTable(doc, {
    startY: typeof walletBalance !== 'undefined' ? 95 : 55,
    head: [['Date', 'From', 'To', 'Amount', 'Type', 'Label', 'Description']],
    body: tableData,
    didDrawPage: () => {
      // Add footer on each page
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.getNumberOfPages()} - Generated by My Crypto Accounting App`,
        105,
        290,
        { align: 'center' }
      );
    },
    styles: { fontSize: 8, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 25 }, // Date
      1: { cellWidth: 30 }, // From
      2: { cellWidth: 30 }, // To
      3: { cellWidth: 25 }, // Amount
      4: { cellWidth: 15 }, // Type
      5: { cellWidth: 30 }, // Label
      6: { cellWidth: 35 }  // Description
    },
    headStyles: { fillColor: [100, 100, 100] },
    alternateRowStyles: { fillColor: [245, 245, 245] }
  });
  
  // Save the PDF
  doc.save(`${walletName.replace(/\s+/g, '_')}_transactions.pdf`);
}

// Helper function to truncate Ethereum addresses
function truncateAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 20) return address;
  return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
} 