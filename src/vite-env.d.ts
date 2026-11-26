/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />
/// <reference types="vite-plugin-pwa/client" />

// Injetados pelo vite.config.ts (define)
declare const __APP_VERSION__: string
declare const __APP_BUILD_DATE__: string

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_APP_MODE: 'development' | 'production'

  readonly VITE_REVERB_APP_KEY: string
  readonly VITE_REVERB_HOST: string
  readonly VITE_REVERB_PORT: string
  readonly VITE_REVERB_SCHEME: 'http' | 'https'
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
