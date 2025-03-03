'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  Settings,
  Wallet,
  BarChart3,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import ConnectWalletButton from '@/components/ConnectWalletButton';
import { LogoutConfirmModal } from '@/components/LogoutConfirmModal';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [blockchainOpen, setBlockchainOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const storedState = localStorage.getItem('sidebarCollapsed');
    if (storedState) {
      setCollapsed(storedState === 'true');
    }
  }, []);
  
  // Save sidebar state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(collapsed));
  }, [collapsed]);
  
  // Handle logout button click
  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };
  
  // Handle logout modal close
  const handleCloseLogoutModal = () => {
    setShowLogoutModal(false);
  };
  
  // Navigation items
  const mainNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Wallet, label: 'Wallets', href: '/dashboard/wallets' },
    { icon: CreditCard, label: 'Transactions', href: '/dashboard/transactions' },
    { icon: BarChart3, label: 'Analytics', href: '/dashboard/analytics' },
    { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  ];
  
  // Blockchain options - only Ethereum has functioning connect button for now
  const blockchainOptions = [
    { 
      label: 'Ethereum', 
      href: '/dashboard/wallets/ethereum', 
      active: true,
      logo: '/images/ethereum.png'
    },
    { 
      label: 'Bitcoin', 
      href: '/dashboard/wallets/bitcoin', 
      active: false,
      logo: '/images/bitcoin.png'
    },
    { 
      label: 'Tron', 
      href: '/dashboard/wallets/tron', 
      active: false,
      logo: '/images/tron.png'
    },
    { 
      label: 'Solana', 
      href: '/dashboard/wallets/solana', 
      active: false,
      logo: '/images/solana.png'
    },
  ];
  
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-shrink-0 z-40 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">CA</span>
              </div>
              <span className="text-lg font-semibold dark:text-white">Crypto Accounting</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-bold">CA</span>
              </div>
            </Link>
          )}
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 ml-2"
          >
            {collapsed ? 
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" /> : 
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            }
          </button>
        </div>
        
        <div className="py-4 overflow-y-auto h-[calc(100vh-65px)]">
          <nav className="px-4 space-y-1">
            {/* Main navigation items */}
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center py-2 ${collapsed ? 'px-0 justify-center' : 'px-3'} rounded-md ${
                    isActive
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
            
            {/* Blockchain dropdown - only show when not collapsed */}
            {!collapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setBlockchainOpen(!blockchainOpen)}
                  className="w-full flex items-center justify-between py-2 px-3 text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 rounded-md"
                >
                  <div className="flex items-center">
                    <Wallet className="h-5 w-5 mr-3" />
                    <span>Blockchains</span>
                  </div>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${blockchainOpen ? 'transform rotate-180' : ''}`}
                  />
                </button>
                
                {blockchainOpen && (
                  <div className="pl-10 pr-2 mt-1 space-y-1">
                    {blockchainOptions.map((option) => (
                      <div key={option.label} className="rounded-md overflow-hidden">
                        <div className="flex items-center justify-between">
                          <Link
                            href={option.href}
                            className={`flex items-center py-2 px-3 rounded-md ${
                              pathname === option.href
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                            } flex-1`}
                          >
                            <div className="relative h-6 w-6 mr-3 flex-shrink-0">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                fill
                                className="rounded-full"
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                            <span>{option.label}</span>
                            {option.active && (
                              <span className="ml-2 w-2 h-2 bg-green-500 rounded-full"></span>
                            )}
                          </Link>
                          <ConnectWalletButton 
                            variant="secondary" 
                            size="sm" 
                            iconOnly={true}
                            className="ml-1 rounded-full"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* If collapsed, show just blockchain icons in a column */}
            {collapsed && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-col items-center space-y-4">
                {blockchainOptions.map((option) => (
                  <Link
                    key={option.label}
                    href={option.href}
                    className={`p-2 rounded-md relative ${
                      pathname === option.href
                        ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="relative h-6 w-6 flex-shrink-0">
                      <Image
                        src={option.logo}
                        alt={option.label}
                        fill
                        className="rounded-full"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>
                    {option.active && (
                      <span className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full"></span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </nav>
        </div>
        
        <div className={`fixed bottom-0 ${collapsed ? 'w-20' : 'w-64'} border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800`}>
          <div className="p-4">
            <Link
              href="/dashboard/settings"
              className={`flex items-center py-2 ${collapsed ? 'px-0 justify-center' : 'px-3'} rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
            >
              <Settings className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span>Settings</span>}
            </Link>
            <button
              onClick={handleLogoutClick}
              className={`flex items-center py-2 ${collapsed ? 'px-0 justify-center w-full' : 'px-3'} rounded-md text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
            >
              <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'}`} />
              {!collapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content - adjust left margin based on sidebar state */}
      <main className={`flex-1 ${collapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <div className="p-6 max-w-6xl mx-auto">
          {/* Dashboard Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold dark:text-white">
                  {pathname === '/dashboard' ? 'Dashboard' : 
                   pathname.includes('/wallets/ethereum') ? 'Ethereum Wallet' :
                   pathname.includes('/wallets/bitcoin') ? 'Bitcoin Wallet' :
                   pathname.includes('/wallets/tron') ? 'Tron Wallet' :
                   pathname.includes('/wallets/solana') ? 'Solana Wallet' :
                   pathname.includes('/wallets') ? 'Wallets' :
                   pathname.includes('/transactions') ? 'Transactions' :
                   pathname.includes('/analytics') ? 'Analytics' :
                   pathname.includes('/reports') ? 'Reports' :
                   pathname.includes('/settings') ? 'Settings' : 'Dashboard'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex space-x-2">
                {pathname === '/dashboard' && (
                  <>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Export Report
                    </button>
                    <ConnectWalletButton variant="primary" size="md" iconOnly={true} />
                  </>
                )}
                {pathname.includes('/wallets') && !pathname.includes('/wallets/') && (
                  <ConnectWalletButton variant="primary" size="md" iconOnly={true} />
                )}
              </div>
            </div>
          </div>
          
          {children}
        </div>
      </main>
      
      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal 
        isOpen={showLogoutModal} 
        onClose={handleCloseLogoutModal} 
      />
    </div>
  );
} 