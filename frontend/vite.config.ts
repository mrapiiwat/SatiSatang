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
        name: 'SATISATANG',
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
            type: 'image/png',
          },
          {
            src: '/logo/512-white.svg',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
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
