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
        // Cachear arquivos estáticos para abrir offline
        globPatterns: ['**/*.{js,css,html,png,svg,woff2}'],

        // Configuração de Background Sync para APIs
        runtimeCaching: [
          {
            // 1. Estratégia para buscar dados (GET)
            urlPattern: /\/api\/.*$/,
            method: 'GET',
            handler: 'NetworkFirst', // Tenta a rede, se falhar ou demorar, busca no cache (útil para offline)
            options: {
              cacheName: 'api-get-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 24 * 60 * 60 // Cache válido por 24h
              },
              // Opcional: define um tempo máximo de espera antes de recorrer ao cache
              networkTimeoutSeconds: 5,
            }
          },
          {
            urlPattern: /\/api\/.*$/,
            method: 'POST',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'sync-post-data',
                options: {
                  maxRetentionTime: 24 * 60 // Tenta reenviar por até 24 horas
                }
              }
            }
          },
          {
            urlPattern: /\/api\/.*$/,
            method: 'PUT',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'sync-update-data',
                options: {
                  maxRetentionTime: 24 * 60 // Tenta reenviar por até 24 horas
                }
              }
            }
          },
          {
            urlPattern: /\/api\/.*$/,
            method: 'DELETE',
            handler: 'NetworkOnly',
            options: {
              backgroundSync: {
                name: 'sync-delete-data',
                options: {
                  maxRetentionTime: 24 * 60 // Tenta reenviar por até 24 horas
                }
              }
            }
          }
        ]
      }
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
