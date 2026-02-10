import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load environment variables from the .env file in the current project root.
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // 'base: "./"' ensures that the built assets use relative paths, 
    // allowing the app to be served from any subdirectory on your VPS.
    base: './',
    define: {
      // Replace process.env references with literal strings from the loaded environment.
      'process.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL || ''),
      'process.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY || ''),
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
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