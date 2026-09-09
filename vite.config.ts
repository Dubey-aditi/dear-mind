import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Generates a service worker AND injects the registration code into the
      // built index.html, so there's no registration script to write by hand.
      registerType: 'autoUpdate',

      // The web app manifest. This is what turns a website into something a
      // phone will offer to install, and what it uses for the home screen.
      manifest: {
        name: 'Dear Mind',
        short_name: 'Dear Mind',
        description: 'A tiny place for your big thoughts.',
        // "standalone" removes the browser chrome — no address bar, no tabs.
        display: 'standalone',
        orientation: 'portrait',
        // The colour behind the app while it's launching, and the status bar.
        background_color: '#f8f6f2',
        theme_color: '#214c76',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            // Android crops icons to whatever shape the launcher uses, so a
            // "maskable" icon keeps its artwork inside the safe middle 80%.
            src: 'maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Everything matching this gets stored in the cache at install time.
        // That's the whole app — HTML, JS, CSS, icons and fonts — which is
        // what lets it open with no network at all.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Any navigation the cache doesn't recognise falls back to index.html,
        // so the app still boots offline no matter what URL it's opened at.
        navigateFallback: '/index.html',
      },
    }),
  ],
})
