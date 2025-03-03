export interface TokenReference {
  address: string;
  symbol: string;
  name: string;
  type: 'stablecoin' | 'utility' | 'governance' | 'defi';
  decimals: number;
}

// Common Ethereum tokens with their contract addresses
export const tokenReferences: TokenReference[] = [
  // Stablecoins
  {
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    symbol: 'USDT',
    name: 'Tether',
    type: 'stablecoin',
    decimals: 6
  },
  {
    address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    symbol: 'USDC',
    name: 'USD Coin',
    type: 'stablecoin',
    decimals: 6
  },
  {
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    type: 'stablecoin',
    decimals: 18
  },
  {
    address: '0x4fabb145d64652a948d72533023f6e7a623c7c53',
    symbol: 'BUSD',
    name: 'Binance USD',
    type: 'stablecoin',
    decimals: 18
  },
  {
    address: '0x8e870d67f660d95d5be530380d0ec0bd388289e1',
    symbol: 'USDP',
    name: 'Pax Dollar',
    type: 'stablecoin',
    decimals: 18
  },
  {
    address: '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
    symbol: 'FEI',
    name: 'Fei USD',
    type: 'stablecoin',
    decimals: 18
  },
  
  // Utility Tokens
  {
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    symbol: 'WETH',
    name: 'Wrapped Ether',
    type: 'utility',
    decimals: 18
  },
  {
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    type: 'utility',
    decimals: 8
  },
  {
    address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    symbol: 'MATIC',
    name: 'Polygon',
    type: 'utility',
    decimals: 18
  },
  {
    address: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    symbol: 'UNI',
    name: 'Uniswap',
    type: 'governance',
    decimals: 18
  },
  {
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
    symbol: 'LINK',
    name: 'Chainlink',
    type: 'utility',
    decimals: 18
  },
  {
    address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    symbol: 'MKR',
    name: 'Maker',
    type: 'governance',
    decimals: 18
  },
  {
    address: '0x6810e776880c02933d47db1b9fc05908e5386b96',
    symbol: 'GNO',
    name: 'Gnosis',
    type: 'utility',
    decimals: 18
  },
  {
    address: '0xc00e94cb662c3520282e6f5717214004a7f26888',
    symbol: 'COMP',
    name: 'Compound',
    type: 'governance',
    decimals: 18
  },
  {
    address: '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
    symbol: 'YFI',
    name: 'yearn.finance',
    type: 'defi',
    decimals: 18
  },
  {
    address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    symbol: 'AAVE',
    name: 'Aave',
    type: 'defi',
    decimals: 18
  }
];

// Function to find a token by its address
export function findTokenByAddress(address: string): TokenReference | undefined {
  // Normalize the address (lowercase) for comparison
  const normalizedAddress = address.toLowerCase();
  return tokenReferences.find(token => token.address === normalizedAddress);
}

// Function to get a human-readable token description
export function getTokenDescription(token: TokenReference): string {
  const typeMap = {
    'stablecoin': 'a stablecoin pegged to the US Dollar',
    'utility': 'a utility token used for network operations',
    'governance': 'a governance token used for protocol voting',
    'defi': 'a DeFi protocol token'
  };
  
  return `${token.name} (${token.symbol}) is ${typeMap[token.type]} on Ethereum.`;
} 