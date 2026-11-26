import vanillaAxios, { type AxiosRequestHeaders } from 'axios'
import { toast } from 'sonner'
import { runtimeConfig } from '@/config/runtime'
import { getTenantId, setTenantId } from '@/lib/tenant'

const appMode = runtimeConfig.APP_MODE
const apiBaseUrl = runtimeConfig.API_URL

if (!apiBaseUrl) throw new Error('VITE_API_URL is not defined')

const axios = vanillaAxios.create({
  baseURL: apiBaseUrl,
  headers: {
    ...(appMode === 'development' && { 'ngrok-skip-browser-warning': 'true' }),
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  validateStatus: () => true, // Não lança exceção para 4xx/5xx
})

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')

  config.headers = config.headers || ({} as AxiosRequestHeaders)

  if (token) config.headers.Authorization = `Bearer ${token}`

  // filial (tenant) em que o usuário está conectado
  const tenant = getTenantId()
  if (tenant) config.headers['X-Tenant'] = tenant

  return config
})

// Controle de toasts para evitar duplicatas
const toastCache = new Map<string, number>()
const TOAST_COOLDOWN = 3000 // 3 segundos

function showToastOnce(key: string, message: string, type: 'error' | 'warning' = 'error') {
  const now = Date.now()
  const lastShown = toastCache.get(key)

  if (!lastShown || now - lastShown > TOAST_COOLDOWN) {
    toastCache.set(key, now)
    if (type === 'error') {
      toast.error(message)
    } else {
      toast.warning(message)
    }
    return true
  }
  return false
}

axios.interceptors.response.use((response) => {
  // acesso à filial selecionada foi removido: volta para o tenant padrão
  if (response.status === 403 && response.data?.code === 'tenant_forbidden') {
    if (showToastOnce('tenant-forbidden', response.data?.message, 'warning')) {
      setTenantId(null)
      setTimeout(() => window.location.reload(), 1500)
    }
  }

  if (response.status === 401) {
    // armazenar papel atual do usuário antes de limpar o localStorage
    const shouldRedirect = showToastOnce('401-error', response.data?.message)

    if (shouldRedirect) {
      setTimeout(() => {
        sessionStorage.clear()
        localStorage.clear()

        if (window.location.pathname !== '/auth/login') {
          window.location.href = '/auth/login'
        }
      }, 1500)
    }
  }

  return response
})

export default axios
