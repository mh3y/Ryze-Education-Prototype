import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  // In production builds, VITE_PORTAL_API_URL must be set so the frontend
  // knows where the API lives. Fail fast rather than silently ship a blank URL.
  // VERCEL_ENV === 'production' only on the main-branch deploy; previews and
  // local builds are allowed through so they don't fail on missing env vars.
  const isVercelProd = process.env.VERCEL_ENV === 'production';
  if (mode === 'production' && isVercelProd) {
    const portalApiUrl = process.env.VITE_PORTAL_API_URL ?? '';
    if (!portalApiUrl) {
      throw new Error(
        '[vite.config] VITE_PORTAL_API_URL is not set. ' +
        'Add it in your Vercel / CI environment variables before building for production.'
      );
    }
  }

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
