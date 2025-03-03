import { supabase } from './client';
import { SupabaseResponse, User } from './types';

/**
 * Create a new user in the users table
 * @param userId User's UUID from auth
 * @param email User's email
 * @param authProvider Authentication provider (email, google, stripe)
 * @returns Promise with the created user or error
 */
export async function createUser(
  userId: string,
  email: string,
  authProvider: string
): Promise<SupabaseResponse<User>> {
  try {
    const newUser: Omit<User, 'id' | 'created_at'> = {
      auth_provider: authProvider,
      email,
      last_login: new Date().toISOString(),
      plan: 'Free',
      ai_requests: 0,
      reports_generated: 0,
    };

    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, ...newUser }])
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to create user: ${errorMessage}` },
    };
  }
}

/**
 * Get a user by ID
 * @param userId User's UUID
 * @returns Promise with the user or error
 */
export async function getUserById(userId: string): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to get user: ${errorMessage}` },
    };
  }
}

/**
 * Get a user by email
 * @param email User's email
 * @returns Promise with the user or error
 */
export async function getUserByEmail(email: string): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to get user by email: ${errorMessage}` },
    };
  }
}

/**
 * Update user's last login timestamp
 * @param userId User's UUID
 * @returns Promise with the updated user or error
 */
export async function updateUserLastLogin(userId: string): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to update last login: ${errorMessage}` },
    };
  }
}

/**
 * Update user's plan
 * @param userId User's UUID
 * @param plan New plan (Free, Pro, Enterprise)
 * @returns Promise with the updated user or error
 */
export async function updateUserPlan(
  userId: string,
  plan: string
): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to update user plan: ${errorMessage}` },
    };
  }
}

/**
 * Increment AI requests count for a user
 * @param userId User's UUID
 * @returns Promise with the updated user or error
 */
export async function incrementAiRequests(userId: string): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase.rpc('increment_ai_requests', {
      user_id: userId,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to increment AI requests: ${errorMessage}` },
    };
  }
}

/**
 * Increment reports generated count for a user
 * @param userId User's UUID
 * @returns Promise with the updated user or error
 */
export async function incrementReportsGenerated(userId: string): Promise<SupabaseResponse<User>> {
  try {
    const { data, error } = await supabase.rpc('increment_reports_generated', {
      user_id: userId,
    });

    if (error) {
      return {
        data: null,
        error: {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        },
      };
    }

    return {
      data: data as User,
      error: null,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      data: null,
      error: { message: `Failed to increment reports generated: ${errorMessage}` },
    };
  }
} 