import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Robust environment variable resolution.
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
console.log('URL Status:', supabaseUrl ? '✅ Found' : '❌ Missing');
console.log('Key Status:', supabaseAnonKey ? '✅ Found' : '❌ Missing');
console.groupEnd();

// Instead of throwing, we export a potentially null client or handle the error.
// This prevents the whole JS bundle from failing to load (White Screen).
export const supabase: SupabaseClient | null = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);