import { Capacitor } from '@capacitor/core'
import { toast } from 'sonner'
import { registerSW } from 'virtual:pwa-register'

// De quanto em quanto tempo o app pergunta ao servidor se há versão nova
const UPDATE_CHECK_INTERVAL_MS = 60 * 1000

const RELOAD_FLAG = 'pwa:preload-error-reload'

/**
 * Registra o service worker e mantém o PWA atualizado.
 *
 * O navegador só verifica se o sw.js mudou quando há uma navegação completa.
 * Um PWA instalado costuma ficar aberto em segundo plano por dias, sem navegação,
 * e por isso continuava rodando a versão antiga. Aqui a verificação é feita:
 *  - a cada minuto enquanto o app estiver visível;
 *  - sempre que o app volta para a tela (visibilitychange);
 *  - quando a internet volta.
 *
 * Quando a versão nova termina de baixar, aparece um aviso com o botão "Atualizar",
 * que ativa o novo service worker e recarrega a página.
 */
export function startPwaUpdater() {
  // No app nativo (Capacitor) os arquivos vêm dentro do APK, não há service worker
  if (Capacitor.isNativePlatform() || !('serviceWorker' in navigator)) return

  handleStaleChunks()

  const updateSW = registerSW({
    immediate: true,

    onNeedRefresh() {
      toast.info('Nova versão disponível', {
        id: 'pwa-update',
        description: 'Toque em "Atualizar" para carregar a versão mais recente do aplicativo.',
        duration: Infinity,
        dismissible: false,
        action: {
          label: 'Atualizar',
          onClick: () => void updateSW(true),
        },
      })
    },

    onRegisteredSW(swUrl, registration) {
      if (!registration) return

      const checkForUpdate = async () => {
        if (document.visibilityState !== 'visible' || !navigator.onLine) return
        if (registration.installing) return

        try {
          // Evita erro de update() quando o servidor está fora do ar
          const response = await fetch(swUrl, {
            cache: 'no-store',
            headers: { 'cache-control': 'no-cache' },
          })
          if (response.ok) await registration.update()
        } catch {
          // sem conexão ou servidor indisponível: tenta de novo na próxima verificação
        }
      }

      setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL_MS)
      document.addEventListener('visibilitychange', checkForUpdate)
      window.addEventListener('online', checkForUpdate)
    },

    onRegisterError(error) {
      console.error('Falha ao registrar o service worker', error)
    },
  })
}

/**
 * Se a página estiver aberta numa versão antiga e tentar carregar um arquivo (chunk)
 * que não existe mais no servidor, recarrega uma vez para buscar a versão atual.
 */
function handleStaleChunks() {
  window.addEventListener('vite:preloadError', (event) => {
    try {
      if (sessionStorage.getItem(RELOAD_FLAG)) return
      sessionStorage.setItem(RELOAD_FLAG, '1')
    } catch {
      return
    }
    event.preventDefault()
    window.location.reload()
  })

  // Página carregou bem: libera um novo recarregamento automático no futuro
  window.addEventListener('load', () => {
    setTimeout(() => {
      try {
        sessionStorage.removeItem(RELOAD_FLAG)
      } catch {
        // armazenamento indisponível
      }
    }, 10_000)
  })
}
