import { createClient } from '@supabase/supabase-js';

// Supabase configuration - using environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Create Supabase client with proper typing
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
