import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SatiSatang',
        short_name: 'สติสตางค์',
        description:
          'สติสตางค์ เป็นเว็บแอปพลิเคชันจัดการการเงินส่วนบุคคล ที่ช่วยให้ผู้ใช้ “มีสติเรื่องสตางค์”',
        theme_color: '#ffffff',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        icons: [
          {
            src: '/logo/192-white.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/logo/512-white.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 30 * 24 * 60 * 60,
              },
            },
          },
        ],
        navigateFallbackDenylist: [/^\/api/, /^\/satisatang/, /^\/docs/],
        importScripts: ['/firebase-messaging-sw.js'],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },
  },
});
