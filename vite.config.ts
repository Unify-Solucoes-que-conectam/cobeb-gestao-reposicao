import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { readFileSync } from 'fs'
import path, { resolve } from 'path'
import { defineConfig } from 'vite'
import svgr from 'vite-plugin-svgr'
import { VitePWA } from 'vite-plugin-pwa'

const packageJson = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf-8'))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // Atualiza o SW automaticamente
      devOptions: {
        enabled: true
      },
      manifest: {
        name: 'Cobeb - Gestão de Reposição',
        short_name: 'Gestão de Reposição',
        description: 'Sistema desenvolvido para gestão de reposição de avarias.',
        theme_color: '#ffffff',
        display: 'standalone',

        start_url: '/auth/login?utm_source=pwa',
        icons: [
          { src: 'cobeb-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'cobeb-512x512.png', sizes: '512x512', type: 'image/png' },
        ],

        screenshots: [
          {
            src: 'screenshot-mobile.png',
            sizes: '530x910',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Tela Inicial no Celular'
          },
          {
            src: 'screenshot-desktop.png',
            sizes: '1907x909',
            type: 'image/png',
            form_factor: 'wide',
            label: 'Painel no Computador'
          }
        ]
      },
      workbox: {
        // atualizar tamanho máximo de arquivo em cache
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB

        // Todo o "casco" do app é pré-cacheado: HTML, JS, CSS, imagens, fontes e sons.
        // É isso que permite abrir o app sem internet.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp,woff,woff2,ttf,mp3,webmanifest}'],

        // Navegação (inclusive F5 em /client/home etc.) sempre cai no index.html da SPA
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],

        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // Apenas recursos de terceiros. As chamadas à API NÃO passam pelo service worker:
        // os dados de consulta ficam no IndexedDB e as ações feitas offline na fila
        // (src/lib/offline), que controla ordem, erros e reenvio.
        runtimeCaching: [
          {
            // CSS das fontes do Google
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            // arquivos das fontes
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    })
  ],
  define: {
    'process.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    watch: {
      usePolling: true,
    },
    host: true,
    strictPort: true,
  },
  build: {
    chunkSizeWarningLimit: 10000,
  },
})
