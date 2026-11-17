import { useEffect, useRef, useSyncExternalStore } from 'react'

import { getOutboxSnapshot, OFFLINE_SYNCED_EVENT, subscribeOutbox } from '@/lib/offline/outbox'
import { getSyncStatus, subscribeSyncStatus } from '@/lib/offline/prefetch'

/** Lista reativa das operações aguardando sincronização. */
export function useOutbox() {
  return useSyncExternalStore(subscribeOutbox, getOutboxSnapshot, getOutboxSnapshot)
}

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/** true quando o navegador reporta que há conexão. */
export function useIsOnline() {
  return useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true
  )
}

/** Executa `callback` sempre que a fila offline terminar de sincronizar algo com o servidor. */
export function useOnSynced(callback: () => void) {
  const ref = useRef(callback)
  ref.current = callback

  useEffect(() => {
    const handler = () => ref.current()
    window.addEventListener(OFFLINE_SYNCED_EVENT, handler)
    return () => window.removeEventListener(OFFLINE_SYNCED_EVENT, handler)
  }, [])
}

/** Andamento e resultado do download dos dados para uso offline. */
export function useSyncStatus() {
  return useSyncExternalStore(subscribeSyncStatus, getSyncStatus, getSyncStatus)
}
