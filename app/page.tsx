'use client';

import { HeroScrollDemo } from '@/components/ui/hero-scroll-demo';
import { Feature108 } from '@/components/blocks/shadcnblocks-com-feature108';
import { Feature197 } from '@/components/blocks/accordion-feature-section';
import { Zap, Pointer, Layout } from 'lucide-react';
import { Header1 } from '@/components/ui/header';
import { CTA } from '@/components/ui/call-to-action';

export default function Home() {
  // Custom data for our Feature108 component
  const featureData = {
    badge: "My Crypto Accounting App",
    heading: "Track Your Crypto Transactions With Ease",
    description: "Connect your wallet, organize your transactions, and get insights - all in one place.",
    tabs: [
      {
        value: "tab-1",
        icon: <Zap className="h-auto w-4 shrink-0" />,
        label: "Connect Wallet",
        content: {
          badge: "Easy Setup",
          title: "Connect your Ethereum wallet in seconds.",
          description:
            "Simply connect your wallet to get started. We'll automatically fetch your transaction history and organize it for you. No complicated setup required.",
          buttonText: "Connect Wallet",
          buttonAction: "/wallet",
          imageSrc:
            "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
          imageAlt: "Ethereum wallet connection",
        },
      },
      {
        value: "tab-2",
        icon: <Pointer className="h-auto w-4 shrink-0" />,
        label: "Track Transactions",
        content: {
          badge: "Powerful Features",
          title: "Organize and categorize your crypto activity.",
          description:
            "View your complete transaction history, label transactions, add notes, and categorize them for better organization. Perfect for tax preparation and financial tracking.",
          buttonText: "View Features",
          buttonAction: "/transactions",
          imageSrc:
            "https://images.unsplash.com/photo-1621501103258-d0882c0cd353?q=80&w=2070&auto=format&fit=crop",
          imageAlt: "Transaction tracking",
        },
      },
      {
        value: "tab-3",
        icon: <Layout className="h-auto w-4 shrink-0" />,
        label: "AI Insights",
        content: {
          badge: "Smart Analysis",
          title: "Get AI-powered insights for better decisions.",
          description:
            "Our AI technology analyzes your transaction patterns and provides personalized insights and suggestions to help you make better financial decisions with your crypto assets.",
          buttonText: "Learn More",
          buttonAction: "/insights",
          imageSrc:
            "https://images.unsplash.com/photo-1634711853733-b831e7ccef7d?q=80&w=1974&auto=format&fit=crop",
          imageAlt: "AI insights for crypto",
        },
      },
    ],
  };
  
  // Custom data for our Feature197 component
  const problemsData = {
    features: [
      {
        id: 1,
        title: "No More Excel for Crypto Transactions",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        description:
          "Stop struggling with complex Excel spreadsheets to track your crypto transactions. Our platform automatically imports and organizes all your transaction data in one centralized location, saving you hours of manual work.",
      },
      {
        id: 2,
        title: "Multi-Wallet Transaction Monitoring",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        description:
          "View transactions from all your wallets in a single dashboard. No more switching between multiple tools and services to get a complete picture of your crypto activity. Perfect for individuals managing multiple addresses or organizations tracking multiple accounts.",
      },
      {
        id: 3,
        title: "AI-Powered Transaction Labeling",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        description:
          "Our AI technology automatically analyzes and categorizes your transactions with accurate labels and descriptions. Stop wasting time manually entering details for each transaction. The system learns from your patterns to provide increasingly accurate categorizations.",
      },
      {
        id: 4,
        title: "Accountant-Friendly Reporting",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        description:
          "Generate professional, structured reports that accountants and lawyers can easily understand. Export clean, organized transaction histories in multiple formats including PDF. Save time and avoid miscommunication when working with financial professionals.",
      },
      {
        id: 5,
        title: "Privacy-Focused Design",
        image: "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=2070&auto=format&fit=crop",
        description:
          "All your data is stored locally in your browser. We never store your wallet keys or sensitive financial data on our servers. Get all the benefits of powerful crypto accounting tools without compromising your security or privacy.",
      },
    ],
  };
  
  return (
    <>
      <Header1 />
      <main className="min-h-screen pt-24 mt-0">
        {/* Hero section with scroll animation */}
        <div className="pb-0 pt-0">
          <HeroScrollDemo />
        </div>
        
        {/* Feature108 component */}
        <div className="mt-10">
          <Feature108 {...featureData} />
        </div>
        
        {/* Feature197 component - Problems We Solve */}
        <div className="mt-40">
          <Feature197 {...problemsData} />
        </div>

        {/* CTA Section */}
        <CTA />
        
        {/* Footer */}
        <footer className="bg-white dark:bg-black p-8 border-t border-gray-200 dark:border-gray-800">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-gray-600 dark:text-gray-400">
              © {new Date().getFullYear()} My Crypto Accounting App. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </>
  );
}
