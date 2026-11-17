import { clienteService, mapaService, tiposAvariaService } from '@/services/api.service'

import { isBrowserOffline } from './network'

let running: Promise<boolean> | null = null
let lastSuccess = 0

/** Evita rebaixar tudo toda vez que a tela inicial é aberta. */
const MIN_INTERVAL_MS = 5 * 60 * 1000

/**
 * Baixa e guarda no aparelho tudo que o motorista precisa para trabalhar sem internet:
 * clientes do mapa, tipos de avaria e, para cada cliente, notas fiscais (com produtos)
 * e avarias já registradas.
 *
 * Retorna true quando o download foi concluído.
 */
export function prefetchMapa(
  mapaId: string | undefined,
  { force = false }: { force?: boolean } = {}
): Promise<boolean> {
  if (!mapaId || isBrowserOffline()) return Promise.resolve(false)
  if (running) return running
  if (!force && Date.now() - lastSuccess < MIN_INTERVAL_MS) return Promise.resolve(true)

  running = (async () => {
    try {
      const [clientes, tipos] = await Promise.all([
        mapaService.clientes({ id: mapaId }),
        tiposAvariaService.read(),
      ])

      // `offline` = veio do cache, ou seja, a API não respondeu: nada novo para baixar
      if (!clientes.success || clientes.offline || tipos.offline) return false

      // poucas requisições em paralelo para não sobrecarregar rede móvel
      const fila = [...clientes.data]
      let ok = true

      const worker = async () => {
        for (let cliente = fila.shift(); cliente; cliente = fila.shift()) {
          const [notas, avarias] = await Promise.all([
            clienteService.notasFiscais({ id: cliente.id }),
            clienteService.avarias({ id: cliente.id }),
          ])
          if (!notas.success || notas.offline || !avarias.success || avarias.offline) ok = false
        }
      }
      await Promise.all([worker(), worker(), worker()])

      if (ok) lastSuccess = Date.now()
      return ok
    } catch (error) {
      console.error('[offline] falha ao baixar dados para uso offline', error)
      return false
    } finally {
      running = null
    }
  })()

  return running
}
