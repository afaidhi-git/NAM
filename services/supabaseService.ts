import { createClient } from '@supabase/supabase-js';

/**
 * These variables are replaced with their actual values from the .env file 
 * by the Vite 'define' configuration at build or development time.
 */
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

// Log helpful debugging information if values are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase configuration error: Missing environment variables.');
  throw new Error(
    "Supabase configuration missing. Please ensure VITE_SUPABASE_URL and " +
    "VITE_SUPABASE_ANON_KEY are correctly defined in your .env file."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
