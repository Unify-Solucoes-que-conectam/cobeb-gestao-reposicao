import { clienteService, mapaService, tiposAvariaService } from '@/services/api.service'

import { cacheGet, cacheSet } from './idb'
import { isBrowserOffline } from './network'

/** Evita rebaixar tudo toda vez que a tela inicial é aberta. */
const MIN_INTERVAL_MS = 5 * 60 * 1000

const META_KEY = 'sync-meta'

export interface SyncMeta {
  mapaId: string
  /** timestamp (ms) do último download COMPLETO */
  at: number
  clientes: number
}

export interface SyncStatus {
  phase: 'idle' | 'running' | 'error'
  done: number
  total: number
  failed: number
  /** nomes dos clientes cujo download falhou (para o motorista saber o que faltou) */
  failedNames: string[]
  message?: string
  /** último download completo (persistido, disponível também offline) */
  last: SyncMeta | null
}

let status: SyncStatus = { phase: 'idle', done: 0, total: 0, failed: 0, failedNames: [], last: null }
const listeners = new Set<() => void>()

function setStatus(patch: Partial<SyncStatus>) {
  status = { ...status, ...patch }
  listeners.forEach((l) => l())
}

export const subscribeSyncStatus = (l: () => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}
export const getSyncStatus = () => status

// carrega o registro do último download completo (sobrevive a fechar o app)
void cacheGet<SyncMeta>(META_KEY).then((entry) => {
  if (entry?.value) setStatus({ last: entry.value })
})

let running: Promise<boolean> | null = null

/**
 * Baixa e guarda no aparelho tudo que o motorista precisa para trabalhar sem internet:
 * clientes do mapa, tipos de avaria e, para cada cliente, notas fiscais (com produtos)
 * e avarias já registradas. O andamento fica em `getSyncStatus()`.
 *
 * Retorna true quando o download foi concluído por completo.
 */
export function prefetchMapa(
  mapaId: string | undefined,
  { force = false }: { force?: boolean } = {}
): Promise<boolean> {
  if (!mapaId || isBrowserOffline()) return Promise.resolve(false)
  if (running) return running

  const last = status.last
  if (!force && last?.mapaId === mapaId && Date.now() - last.at < MIN_INTERVAL_MS) {
    return Promise.resolve(true)
  }

  running = (async () => {
    setStatus({ phase: 'running', done: 0, total: 0, failed: 0, failedNames: [], message: undefined })

    try {
      const [clientes, tipos] = await Promise.all([
        mapaService.clientes({ id: mapaId }),
        tiposAvariaService.read(),
      ])

      // `offline` = a API não respondeu (veio do cache): não há o que baixar agora
      if (clientes.offline || tipos.offline) {
        setStatus({ phase: 'idle' })
        return false
      }
      if (!clientes.success || !tipos.success) {
        setStatus({ phase: 'error', message: clientes.message || tipos.message || 'Falha ao baixar os dados.' })
        return false
      }

      const fila = [...clientes.data]
      setStatus({ total: fila.length })

      // poucas requisições em paralelo para não sobrecarregar rede móvel
      const worker = async () => {
        for (let cliente = fila.shift(); cliente; cliente = fila.shift()) {
          // notas fiscais (com produtos) e avarias do cliente; 1 nova tentativa se falhar
          let falhou = true
          for (let tentativa = 0; tentativa < 2 && falhou; tentativa++) {
            const [notas, avarias] = await Promise.all([
              clienteService.notasFiscais({ id: cliente.id }),
              clienteService.avarias({ id: cliente.id }),
            ])
            falhou = !notas.success || !!notas.offline || !avarias.success || !!avarias.offline
            if (falhou) {
              console.warn('[offline] falha ao baixar cliente', cliente.codigo, {
                notas: notas.message || (notas.offline ? 'sem resposta da API' : ''),
                avarias: avarias.message || (avarias.offline ? 'sem resposta da API' : ''),
              })
            }
          }

          setStatus(
            falhou
              ? {
                  done: status.done + 1,
                  failed: status.failed + 1,
                  failedNames: [...status.failedNames, cliente.nome_fantasia || cliente.razao_social || cliente.codigo],
                }
              : { done: status.done + 1 }
          )
        }
      }
      await Promise.all([worker(), worker()])

      if (status.failed > 0) {
        setStatus({
          phase: 'error',
          message: `${status.failed} cliente(s) não foram baixados.`,
        })
        return false
      }

      const meta: SyncMeta = { mapaId, at: Date.now(), clientes: status.total }
      await cacheSet(META_KEY, meta)
      setStatus({ phase: 'idle', last: meta })
      return true
    } catch (error) {
      console.error('[offline] falha ao baixar dados para uso offline', error)
      setStatus({ phase: 'error', message: 'Falha ao baixar os dados.' })
      return false
    } finally {
      running = null
    }
  })()

  return running
}
