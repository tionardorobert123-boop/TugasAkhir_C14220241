import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  plugins: [
    react(),

    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        enabled: true
      },

      includeAssets: ['favicon.ico'],

      manifest: {
        id: '/',

        name: 'Sistem Kontrol Akses dan Monitoring Room Karaoke',

        short_name: 'Karaoke',

        description: 'Monitoring dan kontrol room karaoke',

        theme_color: '#000000',

        background_color: '#ffffff',

        display: 'standalone',

        start_url: '/',

        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },

          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico}'],

        runtimeCaching: [
          {
            urlPattern:
            /^https:\/\/tugasakhirc14220241\.up\.railway\.app\/api/,
            handler: 'NetworkFirst',

            options: {
              cacheName: 'api-cache',

              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24
              },

              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],

  server: {
    host: '0.0.0.0'
  },

  preview: {
    host: '0.0.0.0',
    allowedHosts: true
  }
})