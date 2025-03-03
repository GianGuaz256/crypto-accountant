// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock next/router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock window.ethereum
Object.defineProperty(window, 'ethereum', {
  value: {
    isMetaMask: true,
    request: jest.fn().mockResolvedValue(['0x123']),
    on: jest.fn(),
    removeListener: jest.fn(),
    selectedAddress: '0x123',
    chainId: '0x1',
    isConnected: jest.fn().mockReturnValue(true),
  },
  writable: true,
}); 