# My Crypto Accounting App

A privacy-focused web application that allows users to connect their crypto wallets, track transactions, manage labels and descriptions, analyze data with AI, and export reports as PDFs.

## Key Features

- **Wallet Connection**: Connect your Ethereum wallet (MetaMask, Coinbase Wallet, WalletConnect)
- **Transaction Management**: View and categorize your crypto transactions
- **AI-Powered Analysis**: Get intelligent suggestions for transaction labels and descriptions
- **PDF Reporting**: Generate well-formatted transaction reports
- **Privacy-First**: All data is stored in your browser's local storage - no server-side storage

## Tech Stack

- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with dark/light mode support
- **Wallet Integration**: ethers.js
- **PDF Generation**: jsPDF
- **AI Analysis**: OpenAI API (with fallback to mock suggestions)
- **Data Storage**: Browser's Local Storage API

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- npm or yarn
- MetaMask or another Ethereum wallet browser extension

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/my-crypto-accounting-app.git
   cd my-crypto-accounting-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up API keys (optional):
   - For Etherscan API: Update `NEXT_PUBLIC_ETHERSCAN_API_KEY` in utils/transactionFetcher.ts
   - For OpenAI API: Update `NEXT_PUBLIC_OPENAI_API_KEY` in utils/aiAnalyzer.ts

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
# or
yarn build
yarn start
```

## Usage Guide

1. **Connect Wallet**: On the homepage, click "Connect Wallet" and authorize access
2. **Name Your Wallet**: Enter a name for easy identification
3. **View Transactions**: Your wallet's transactions will be displayed in a table
4. **Edit Details**: Click "Edit" on any transaction to add labels and descriptions
5. **Use AI Analysis**: Click "Analyze Transactions with AI" to get smart categorization suggestions
6. **Export Report**: Generate a PDF report of your transactions with all metadata

## Privacy Notice

All your data, including wallet addresses, transaction details, and user inputs, is stored only in your browser's local storage. No information is sent to our servers. The only external API calls are:

- To Etherscan API to fetch transaction data
- To OpenAI API for AI analysis (if you've set an API key)

## Customization

- Update the theme by modifying the Tailwind configuration
- Add additional blockchain support by extending the transactionFetcher.ts utility
- Implement additional features by extending the component structure

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
