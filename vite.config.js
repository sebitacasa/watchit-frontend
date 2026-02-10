import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // Se actualiza sola cuando haces deploy
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'WatchItTogether',
        short_name: 'WatchIt',
        description: 'Watch YouTube videos with friends in real-time.',
        theme_color: '#171717', // Coincide con tu bg-neutral-900
        background_color: '#171717',
        display: 'standalone', // Esto quita la barra del navegador (URL)
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png', // Tienes que crear esta imagen
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
           src: 'icon.svg', 
            sizes: '192x192 512x512', // Sirve para ambos tamaños
            type: 'image/svg+xml',
          purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})