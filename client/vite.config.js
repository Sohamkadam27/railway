import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// This file configures the frontend development server.
// The 'proxy' is essential for connecting to your backend without CORS issues.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000', // Your Express backend server
        changeOrigin: true,
        secure: false
      },
    }
  }
});
