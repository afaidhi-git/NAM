import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable resolution.
 * Attempts to use Vite's standard import.meta.env first, 
 * falling back to process.env (injected by Vite define).
 */
// @ts-ignore
const getEnv = (key: string) => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Diagnostic logging for the browser console
console.group('Nexus Supabase Initialization');
console.log('URL Status:', supabaseUrl ? '✅ Resolved' : '❌ Missing');
console.log('Key Status:', supabaseAnonKey ? '✅ Resolved' : '❌ Missing');
console.groupEnd();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase configuration missing. Please ensure VITE_SUPABASE_URL and " +
    "VITE_SUPABASE_ANON_KEY are correctly defined in your .env file or VPS environment variables."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);