export interface RuntimeConfig {
  API_URL: string
  APP_MODE: string
  REVERB_APP_KEY: string
  REVERB_HOST: string
  REVERB_PORT: number
  REVERB_SCHEME: 'http' | 'https'
}

declare global {
  interface Window {
    __COBEB_CONFIG__?: Partial<RuntimeConfig>
  }
}

const runtime = typeof window !== 'undefined' ? window.__COBEB_CONFIG__ ?? {} : {}
const defaultScheme = typeof window !== 'undefined' && window.location.protocol === 'http:' ? 'http' : 'https'

export const runtimeConfig: RuntimeConfig = {
  API_URL: runtime.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000',
  APP_MODE: runtime.APP_MODE || import.meta.env.VITE_APP_MODE || 'production',
  REVERB_APP_KEY: runtime.REVERB_APP_KEY || import.meta.env.VITE_REVERB_APP_KEY || '',
  REVERB_HOST: runtime.REVERB_HOST || import.meta.env.VITE_REVERB_HOST || (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
  REVERB_PORT: Number(runtime.REVERB_PORT || import.meta.env.VITE_REVERB_PORT || (defaultScheme === 'https' ? 443 : 80)),
  REVERB_SCHEME: runtime.REVERB_SCHEME || import.meta.env.VITE_REVERB_SCHEME || defaultScheme,
}
