'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUser, getCurrentUser } from '@/lib/supabase';
import { toast } from 'sonner';

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current user after OAuth redirect
        const { data: user, error: userError } = await getCurrentUser();

        if (userError) {
          console.error('Error getting user:', userError);
          setError('Authentication failed. Please try again.');
          return;
        }

        if (user) {
          // Check if this is a new user by trying to create a user record
          const { error: createError } = await createUser(
            user.id,
            user.email,
            user.auth_provider
          );

          // If there's an error, it might be because the user already exists,
          // which is fine in this case
          if (createError) {
            console.log('User might already exist:', createError.message);
          }

          toast.success('Successfully authenticated!');
          router.push('/dashboard');
        } else {
          setError('No user data found. Please try again.');
        }
      } catch (err) {
        console.error('Error in auth callback:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    };

    // Process the callback
    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Authentication Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.push('/signin')}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Completing authentication...</h2>
        <p className="text-gray-600 dark:text-gray-400">Please wait while we set up your account.</p>
      </div>
    </div>
  );
} 