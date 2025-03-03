'use client';

import { ReactNode } from 'react';
import { WagmiProvider as WagmiProviderCore, createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Initialize react-query client
const queryClient = new QueryClient();

// Configure wagmi client
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

interface WagmiProviderProps {
  children: ReactNode;
}

export function WagmiProvider({ children }: WagmiProviderProps) {
  return (
    <WagmiProviderCore config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProviderCore>
  );
} 