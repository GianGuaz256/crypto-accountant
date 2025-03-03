import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import { WalletProvider } from './contexts/WalletContext';
import { AuthProvider } from './contexts/AuthContext';
import { WagmiProvider } from './providers/WagmiProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Crypto Accounting App",
  description: "Track, manage, and analyze your crypto transactions with AI assistance",
  keywords: [
    "crypto", 
    "accounting", 
    "blockchain", 
    "ethereum", 
    "transactions", 
    "wallet", 
    "finance", 
    "cryptocurrency"
  ],
  authors: [
    {
      name: "Your Name",
      url: "https://yourwebsite.com",
    },
  ],
  creator: "Your Name",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://my-crypto-accounting-app.example.com",
    title: "My Crypto Accounting App",
    description: "Track, manage, and analyze your crypto transactions with AI assistance",
    siteName: "My Crypto Accounting App",
  },
  twitter: {
    card: "summary_large_image",
    title: "My Crypto Accounting App",
    description: "Track, manage, and analyze your crypto transactions with AI assistance",
    creator: "@yourtwitter",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          defaultTheme="system"
          enableSystem
        >
          <WagmiProvider>
            <AuthProvider>
              <WalletProvider>
                {children}
                <Toaster />
              </WalletProvider>
            </AuthProvider>
          </WagmiProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
