import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  // API_PROXY_TARGET controls where /api/* requests are forwarded in dev.
  // Default: local backend on :8000 (matches docker-compose + server/ setup).
  // Override in .env: API_PROXY_TARGET=https://ryzeeducation.com.au to use
  // the production backend instead.
  const apiTarget = process.env.API_PROXY_TARGET ?? 'http://localhost:8000';
  const isLocal   = apiTarget.startsWith('http://localhost');

  return {
    publicDir: 'public',
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: !isLocal,
        },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'motion-vendor': ['framer-motion'],
            'icon-vendor': ['lucide-react'],
          }
        }
      }
    }
  };
});
