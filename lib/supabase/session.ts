import { supabase } from './client';
import { Session, SupabaseResponse } from './types';

/**
 * Get the current session from Supabase Auth
 * @returns Promise with the session or error
 */
export async function getSession(): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        data: null,
        error: { message: error.message },
      };
    }

    return {
      data: data.session,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to get session: ${errorMessage}` },
    };
  }
}

/**
 * Check if a user is authenticated
 * @returns Promise with boolean indicating if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data } = await getSession();
  return !!data;
}

/**
 * Set up session persistence in localStorage
 * This is handled automatically by Supabase Auth, but this function
 * can be used to customize the behavior if needed
 */
export function setupSessionPersistence(): void {
  // Supabase Auth handles session persistence automatically
  // This function is a placeholder for any custom session persistence logic
  console.log('Session persistence is handled automatically by Supabase Auth');
}

/**
 * Refresh the session token
 * @returns Promise with the new session or error
 */
export async function refreshSession(): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return {
        data: null,
        error: { message: error.message },
      };
    }

    return {
      data: data.session,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to refresh session: ${errorMessage}` },
    };
  }
}

/**
 * Set up a listener for auth state changes
 * @param callback Function to call when auth state changes
 * @returns Unsubscribe function
 */
export function onAuthStateChange(
  callback: (session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });

  return () => {
    data.subscription.unsubscribe();
  };
}

/**
 * Get the JWT token from the current session
 * @returns Promise with the JWT token or null
 */
export async function getJwtToken(): Promise<string | null> {
  const { data } = await getSession();
  return data?.access_token || null;
}

/**
 * Get the user ID from the current session
 * @returns Promise with the user ID or null
 */
export async function getUserId(): Promise<string | null> {
  const { data } = await getSession();
  return data?.user?.id || null;
} 