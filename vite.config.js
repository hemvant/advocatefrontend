import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'vite.svg'],
      manifest: {
        name: 'AdvocateLearn',
        short_name: 'AdvocateLearn',
        description: 'Multi-organization Legal SaaS',
        theme_color: '#0B1F3A',
        background_color: '#F8F9FA',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/vite.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          { urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i, handler: 'CacheFirst', options: { cacheName: 'google-fonts-cache' } }
        ]
      }
    })
  ],
  server: {
    host: "0.0.0.0",     // 🔥 important (allow network access)
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://192.168.1.6:5000',  // 🔥 backend IP
        changeOrigin: true
      }
    }
  }
});
