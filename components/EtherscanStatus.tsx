'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export function EtherscanStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState<string>('Checking Etherscan API connection...');
  const [details, setDetails] = useState<string>('');

  useEffect(() => {
    async function checkConnection() {
      try {
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || 'YourEtherscanApiKey';
        console.log('🔍 Testing Etherscan API connection');
        console.log('🔑 Using API key:', apiKey === 'YourEtherscanApiKey' ? 'Default placeholder (not valid)' : 'Custom key (masked)');
        
        // Test URL - just getting the ETH balance of Vitalik's address as a simple API test
        const testAddress = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'; // vitalik.eth
        const url = `https://api.etherscan.io/api?module=account&action=balance&address=${testAddress}&tag=latest&apikey=${apiKey}`;
        
        console.log('🌐 Testing with URL:', url.replace(apiKey, 'API_KEY_HIDDEN'));
        const response = await axios.get(url);
        console.log('📡 Etherscan test response:', response.data);
        
        if (response.data.status === '1') {
          setStatus('connected');
          setMessage('✅ Connected to Etherscan API successfully');
          setDetails(`Received ETH balance (wei): ${response.data.result}`);
        } else {
          setStatus('error');
          setMessage('⚠️ Etherscan API responded but with error');
          setDetails(`Error message: ${response.data.message || 'Unknown error'}`);
        }
      } catch (error) {
        console.error('❌ Failed to connect to Etherscan:', error);
        setStatus('error');
        setMessage('❌ Failed to connect to Etherscan API');
        setDetails(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    checkConnection();
  }, []);

  return (
    <div className="p-4 border rounded-md my-4">
      <h3 className="font-bold mb-2">Etherscan API Status</h3>
      
      {status === 'checking' && (
        <div className="text-yellow-600">
          <p>🔄 {message}</p>
        </div>
      )}
      
      {status === 'connected' && (
        <div className="text-green-600">
          <p>{message}</p>
          <p className="text-xs mt-1">{details}</p>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-red-600">
          <p>{message}</p>
          <p className="text-xs mt-1">{details}</p>
          <div className="mt-2 text-gray-700 text-xs">
            <p>To fix this:</p>
            <ol className="list-decimal list-inside">
              <li>Get an API key from <a href="https://etherscan.io/apis" target="_blank" rel="noopener noreferrer" className="underline">etherscan.io/apis</a></li>
              <li>Add it to your .env.local file as NEXT_PUBLIC_ETHERSCAN_API_KEY</li>
              <li>Restart your development server</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
} 