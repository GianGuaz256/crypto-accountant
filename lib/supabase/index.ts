// Export the Supabase client
export { supabase } from './client';

// Export types
export * from './types';

// Export user management utilities
export * from './users';

// Export address management utilities
export * from './addresses';

// Export authentication utilities
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  getCurrentUser,
  updatePassword,
  resetPassword
} from './auth';

// Export session utilities with unique names to avoid conflicts
export {
  getSession as getSupabaseSession,
  isAuthenticated as isSupabaseAuthenticated,
  refreshSession as refreshSupabaseSession,
  setupSessionPersistence,
  onAuthStateChange,
  getJwtToken,
  getUserId
} from './session'; 