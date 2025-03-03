/**
 * @jest-environment jsdom
 */

import { saveWalletData, getWalletData, saveTransactions, getTransactions, clearStoredData } from '@/utils/localStorageUtils';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('localStorageUtils', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('wallet data', () => {
    it('should save and retrieve wallet data', () => {
      const walletData = { address: '0x123abc', name: 'Test Wallet' };
      saveWalletData(walletData);
      
      expect(getWalletData()).toEqual(walletData);
    });

    it('should return null when no wallet data exists', () => {
      expect(getWalletData()).toBeNull();
    });
  });

  describe('transactions', () => {
    it('should save and retrieve transactions', () => {
      const transactions = [
        {
          date: '2023-01-01',
          from: '0x123',
          to: '0x456',
          value: '1.0',
          label: 'Test',
          description: 'Test transaction'
        }
      ];
      
      saveTransactions(transactions);
      
      expect(getTransactions()).toEqual(transactions);
    });

    it('should return empty array when no transactions exist', () => {
      expect(getTransactions()).toEqual([]);
    });
  });

  describe('clearStoredData', () => {
    it('should clear all stored data', () => {
      const walletData = { address: '0x123abc', name: 'Test Wallet' };
      const transactions = [{ date: '2023-01-01', from: '0x123', to: '0x456', value: '1.0' }];
      
      saveWalletData(walletData);
      saveTransactions(transactions);
      
      expect(getWalletData()).not.toBeNull();
      expect(getTransactions().length).toBeGreaterThan(0);
      
      clearStoredData();
      
      expect(getWalletData()).toBeNull();
      expect(getTransactions()).toEqual([]);
    });
  });
}); 