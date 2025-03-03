// This test mocks the wallet connection flow

describe('Wallet Connection Flow', () => {
  beforeEach(() => {
    // Mock localStorage
    cy.clearLocalStorage();
    
    // Mock ethereum provider
    cy.on('window:before:load', (win) => {
      win.ethereum = {
        isMetaMask: true,
        request: () => Promise.resolve(['0x123456789abcdef123456789abcdef123456789']),
        on: () => {},
        removeListener: () => {},
        selectedAddress: '0x123456789abcdef123456789abcdef123456789',
        chainId: '0x1',
        isConnected: () => true
      };
    });
    
    // Mock window.prompt to return a wallet name
    cy.window().then((win) => {
      cy.stub(win, 'prompt').returns('Test Wallet');
    });
  });

  it('should connect wallet and navigate to wallet page', () => {
    // Visit the home page
    cy.visit('/');
    
    // Check that the app title is displayed
    cy.contains('My Crypto Accounting App').should('be.visible');
    
    // Click the connect wallet button
    cy.contains('Connect Wallet').click();
    
    // Should navigate to wallet page
    cy.url().should('include', '/wallet');
    
    // Wallet name should be displayed
    cy.contains('Wallet: Test Wallet').should('be.visible');
    
    // Mock transactions should be displayed
    cy.contains('Transactions').should('be.visible');
  });

  it('should allow disconnecting and return to home page', () => {
    // Set up localStorage with wallet data
    cy.window().then((win) => {
      win.localStorage.setItem('wallet', JSON.stringify({
        address: '0x123456789abcdef123456789abcdef123456789',
        name: 'Test Wallet'
      }));
      
      // Add some mock transactions
      win.localStorage.setItem('transactions', JSON.stringify([
        {
          date: new Date().toLocaleDateString(),
          from: '0x123...abc',
          to: '0x456...def',
          value: '0.1',
          label: '',
          description: ''
        }
      ]));
    });
    
    // Visit the wallet page directly
    cy.visit('/wallet');
    
    // Check wallet page is displayed correctly
    cy.contains('Wallet: Test Wallet').should('be.visible');
    
    // Click disconnect button
    cy.contains('Disconnect').click();
    
    // Should navigate back to home page
    cy.url().should('not.include', '/wallet');
    cy.contains('Connect Your Wallet').should('be.visible');
  });
}); 