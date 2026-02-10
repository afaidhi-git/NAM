import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file.
  // The empty string parameter allows loading variables without the VITE_ prefix if needed.
  const env = loadEnv(mode, process.cwd(), '');
  
  // Robustly capture Supabase variables, checking both the .env file and the system environment.
  const supabaseUrl = env.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  const apiKey = env.API_KEY || process.env.API_KEY || '';

  return {
    plugins: [react()],
    base: './',
    define: {
      // We define these for literal replacement in the source code.
      // This is the most reliable way to ensure they are available in the browser.
      'process.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Also explicitly setting import.meta.env as an extra layer of reliability for Vite
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(supabaseUrl),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(supabaseAnonKey),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'recharts', '@supabase/supabase-js'],
          },
        },
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    }
  };
});