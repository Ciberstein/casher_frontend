import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['img/favicon.svg', 'img/apple-touch-icon-180x180.png'],
      manifest: {
        name: 'Casher',
        short_name: 'Casher',
        description: 'Plataforma de gestión financiera',
        theme_color: '#ef4444',
        background_color: '#0f172a',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        orientation: 'portrait',
        icons: [
          { src: 'img/pwa-64x64.png',           sizes: '64x64',   type: 'image/png' },
          { src: 'img/pwa-192x192.png',          sizes: '192x192', type: 'image/png' },
          { src: 'img/pwa-512x512.png',          sizes: '512x512', type: 'image/png' },
          { src: 'img/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
    }),
  ],
})
