/**
 * Format a number as currency (USD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a crypto amount with appropriate decimals
 */
export function formatCryptoAmount(amount: number, symbol: string): string {
  // Different cryptos have different decimal precision standards
  const decimals = {
    'ETH': 4,
    'BTC': 8,
    'SOL': 3,
    'TRX': 2,
    'USDC': 2,
    'default': 4
  };
  
  const precision = decimals[symbol as keyof typeof decimals] || decimals.default;
  
  return `${amount.toFixed(precision)} ${symbol}`;
}

/**
 * Format a wallet address for display (truncate middle)
 */
export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format a percentage value
 */
export function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
} 