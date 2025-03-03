/**
 * TypeScript interfaces for Supabase data models
 */

// User model
export interface User {
  id: string;
  auth_provider: string;
  email: string;
  created_at: string;
  last_login: string;
  plan: string;
  ai_requests: number;
  reports_generated: number;
}

// Address model
export interface Address {
  id: string;
  user_id: string;
  address: string;
  blockchain: string;
  added_at: string;
  transaction_count: number;
}

// Session model
export interface Session {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: {
    id: string;
    email?: string;
    app_metadata?: {
      provider?: string;
    };
    user_metadata?: Record<string, unknown>;
    created_at?: string;
  };
}

// Auth error model
export interface AuthError {
  message: string;
  status?: number;
}

// Database error model
export interface DatabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Response type for Supabase operations
export interface SupabaseResponse<T> {
  data: T | null;
  error: AuthError | DatabaseError | null;
} 