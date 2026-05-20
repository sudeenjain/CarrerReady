import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')

  return {
    server: {
      // allow port override via VITE_PORT and fall back if already in use
      port: parseInt(env.VITE_PORT) || 3000,
      host: '0.0.0.0',
      strictPort: false, // let vite try the next available port if 3000 is taken
    },

    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'cr-logo.png', 'cr-logo.svg', 'icon.svg'],
        manifest: {
          name: 'CareerReady AI 2.0',
          short_name: 'CareerReady',
          theme_color: '#020617',
          background_color: '#020617',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/cr-logo.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/cr-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/cr-logo.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any'
            }
          ],
        },
      }),
    ],

    /**
     * Vite does NOT expose process.env by default.
     * This keeps your existing logic intact and correct.
     */
    define: {
      'process.env': {}, // prevents runtime undefined errors
      'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'), // keeps your existing alias
      },
    },

    /**
     * Recommended build safety (no behavior change)
     */
    build: {
      sourcemap: true,
    },
  }
})
