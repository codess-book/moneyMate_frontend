import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import {VitePWA} from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  //plugins: [react(),

  // VitePWA({
     

  //    registerType: 'autoUpdate', // Automatically updates PWA when new build is deployed
  //    includeAssets: ['favicon.svg', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png','offline.html'], // Optional
  //    manifest: {
  //      name: 'RM traders',
  //      short_name: 'RM',
  //      description: 'बिलिंग और ग्राहक प्रबंधन आसान बनाएं',
  //      theme_color: '#ffffff',
  //      background_color: '#ffffff',
  //      display: 'standalone',
  //      start_url: '/',
  //      icons: [
  //        {
  //          src: 'pwa-192x192.png',
  //          sizes: '192x192',
  //          type: 'image/png',
  //        },
  //        {
  //          src: 'pwa-512x512.png',
  //          sizes: '512x512',
  //          type: 'image/png',
  //        },
  //        {
  //          src: 'pwa-512x512.png',
  //          sizes: '512x512',
  //          type: 'image/png',
  //          purpose: 'any maskable',
  //        },
  //      ],
  //    },
  //            workbox: {
  //              navigateFallback: '/offline.html', 
  //               importScripts: [],
  //      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],  //syd iski wjah se hum glti kr rha hai iske karaan abhi apis kaam nhi kr rhi hai
      
  //      runtimeCaching: [
  //        {
  //          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
  //          handler: 'CacheFirst',
  //          options: {
  //            cacheName: 'google-fonts',

  //            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
  //          },
  //        },
  //        {
  //          urlPattern: /^https:\/\/your-api-domain\.com\/.*/i,
  //          handler: 'NetworkFirst',
  //          options: {
  //            cacheName: 'api-cache',
  //            networkTimeoutSeconds: 10,
  //            expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 }
  //          },
  //        },
  //      ],

  //    },
  //  }),


  //],


    plugins: [
    react(),
    VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.svg', 'robots.txt', 'pwa-192x192.png', 'pwa-512x512.png'],
  manifest: {
    name: 'RM traders',
    short_name: 'RM',
    description: 'बिलिंग और ग्राहक प्रबंधन आसान बनाएं',
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
    start_url: '/',
    icons: [
      {
        src: 'pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: 'pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
  workbox: {
    //navigateFallback: '/offline.html',
    navigateFallback: 'index.html',
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365
          }
        }
      },
      {
        urlPattern: /^http:\/\/localhost:8080\/api\/.*/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          networkTimeoutSeconds: 10,
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24
          }
        }
      }
    ]
  }
}),
    tailwindcss(),

  ],

})
