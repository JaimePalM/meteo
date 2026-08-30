import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  root: '.',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        logLevel: 'debug',
        onProxyRes: (proxyRes, req, res) => {
          console.log('[VITE PROXY] Response from', proxyRes.statusCode, req.url);
        },
        onError: (err, req, res) => {
          console.error('[VITE PROXY] Error:', err.message, 'URL:', req.url);
        }
      },
    },
  },
  preview: {
    port: 3000,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/') || id.includes('node_modules/react-router-dom/')) return 'react';
        },
      },
    },
  },
})
