import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  // Removed the 'define' block that was exposing GEMINI_API_KEY globally.
  // Keys should now be accessed via import.meta.env.VITE_...
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  }
});