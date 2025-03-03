interface WalletData {
  address: string;
  name: string;
}

interface Transaction {
  date: string;
  from: string;
  to: string;
  value: string;
  label?: string;
  description?: string;
}

export function saveWalletData(data: WalletData): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wallet', JSON.stringify(data));
  }
}

export function getWalletData(): WalletData | null {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('wallet');
    return data ? JSON.parse(data) : null;
  }
  return null;
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }
}

export function getTransactions(): Transaction[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('transactions');
    return data ? JSON.parse(data) : [];
  }
  return [];
}

export function clearStoredData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wallet');
    localStorage.removeItem('transactions');
  }
} 