import { supabase } from './client';
import { Session, SupabaseResponse, User } from './types';

/**
 * Sign up a new user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise with the session or error
 */
export async function signUpWithEmail(
  email: string,
  password: string
): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    // Return the session data
    return {
      data: data.session,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred during sign up: ${errorMessage}` },
    };
  }
}

/**
 * Sign in a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise with the session or error
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    // Update the user's last login timestamp
    if (data.user) {
      // Update last login directly instead of using the function from users.ts
      try {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      } catch (updateErr) {
        console.error('Failed to update last login:', updateErr);
      }
    }

    // Return the session data
    return {
      data: data.session,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred during sign in: ${errorMessage}` },
    };
  }
}

/**
 * Sign in a user with OAuth provider
 * @param provider OAuth provider (e.g., 'google')
 * @returns Promise with the sign in URL or error
 */
export async function signInWithOAuth(
  provider: 'google'
): Promise<SupabaseResponse<{ url: string }>> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: { url: data.url },
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred during OAuth sign in: ${errorMessage}` },
    };
  }
}

/**
 * Sign out the current user
 * @returns Promise with success status or error
 */
export async function signOut(): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred during sign out: ${errorMessage}` },
    };
  }
}

/**
 * Get the current session
 * @returns Promise with the session or null
 */
export async function getSession(): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: data.session,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred while getting session: ${errorMessage}` },
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
 * Get the current user
 * @returns Promise with the user or null
 */
export async function getCurrentUser(): Promise<SupabaseResponse<User>> {
  try {
    const { data: sessionData, error: sessionError } = await getSession();

    if (sessionError || !sessionData) {
      return { 
        data: null, 
        error: sessionError || { message: 'No active session found.' } 
      };
    }

    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    // Convert auth user to our User type
    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      auth_provider: data.user.app_metadata.provider || 'email',
      created_at: data.user.created_at || new Date().toISOString(),
      last_login: new Date().toISOString(),
      plan: 'Free', // Default value, will be updated from the database
      ai_requests: 0,
      reports_generated: 0,
    };

    return {
      data: user,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred while getting user: ${errorMessage}` },
    };
  }
}

/**
 * Refresh the session
 * @returns Promise with the new session or error
 */
export async function refreshSession(): Promise<SupabaseResponse<Session>> {
  try {
    const { data, error } = await supabase.auth.refreshSession();

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: data.session,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred while refreshing session: ${errorMessage}` },
    };
  }
}

/**
 * Reset password for a user
 * @param email User's email
 * @returns Promise with success status or error
 */
export async function resetPassword(email: string): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred during password reset: ${errorMessage}` },
    };
  }
}

/**
 * Update password for the current user
 * @param password New password
 * @returns Promise with success status or error
 */
export async function updatePassword(password: string): Promise<SupabaseResponse<boolean>> {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      return { data: null, error: { message: error.message } };
    }

    return {
      data: true,
      error: null,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `An unexpected error occurred while updating password: ${errorMessage}` },
    };
  }
} 