// This file ensures TypeScript recognizes Jest globals
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveBeenCalled(): R;
      toHaveBeenCalledWith(...args: unknown[]): R;
      toBe(expected: unknown): R;
    }
  }
}

export {}; 