'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  isSupabaseAuthenticated, 
  getCurrentUser, 
  signOut,
  User
} from '@/lib/supabase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  logout: async () => {},
  refreshUser: async () => {},
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Function to refresh user data
  const refreshUser = async () => {
    try {
      const authenticated = await isSupabaseAuthenticated();
      setIsAuthenticated(authenticated);

      if (authenticated) {
        const { data, error } = await getCurrentUser();
        if (error) {
          console.error('Error fetching user:', error);
          setUser(null);
          return;
        }
        setUser(data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        toast.error(error.message);
        return;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
      router.push('/signin');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to log out');
    }
  };

  // Check authentication status on mount and when pathname changes
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkAuth();
  }, [pathname]);

  // Protect routes that require authentication
  useEffect(() => {
    const protectRoutes = async () => {
      // Skip protection for auth-related routes
      const publicRoutes = ['/signin', '/signup', '/'];
      if (publicRoutes.includes(pathname)) {
        return;
      }

      // If not authenticated and not loading, redirect to signin
      if (!isLoading && !isAuthenticated) {
        toast.error('Please sign in to access this page');
        router.push('/signin');
      }
    };

    protectRoutes();
  }, [isAuthenticated, isLoading, pathname, router]);

  const value = {
    user,
    isLoading,
    isAuthenticated,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
} 