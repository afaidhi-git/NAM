import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Robust environment variable resolution.
 * Checks import.meta.env (Vite), process.env (Node/VPS), and window (Shim).
 */
const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (window.process && window.process.env && window.process.env[key]) {
      // @ts-ignore
      return window.process.env[key];
    }
  } catch (e) {}
  
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

// Log configuration status safely
if (!isSupabaseConfigured) {
  console.warn('Supabase credentials missing. Check your .env file.');
}

export const supabase: SupabaseClient | null = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;