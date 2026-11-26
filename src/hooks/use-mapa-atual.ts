import { useEffect, useState } from 'react'

import { useAuth } from '@/hooks/use-auth'
import dayjs from '@/lib/dayjs'
import { Mapa } from '@/types/consults'

/**
 * Rota em andamento: designada hoje, com entrega hoje e não encerrada.
 * Toda rota é encerrada às 00h; a checagem também vale com o app offline,
 * já que a sessão (com o mapa) fica salva no aparelho.
 */
export function isMapaAtivo(mapa?: Mapa | null): mapa is Mapa {
  if (!mapa?.id || mapa.status === 'encerrado') return false
  if (!dayjs(mapa.data_entrega).isToday()) return false
  return !mapa.designado_em || dayjs(mapa.designado_em).isToday()
}

/** Mapa atual do motorista logado; deixa de valer automaticamente à meia-noite. */
export function useMapaAtual(): Mapa | null {
  const { user, refreshSession } = useAuth()
  // força reavaliar a data (virada do dia / app voltando do segundo plano)
  const [, setTick] = useState(0)

  useEffect(() => {
    const atualizar = () => {
      setTick((t) => t + 1)
      void refreshSession()
    }

    // agenda a reavaliação para 00h (+1s de folga)
    let timer: ReturnType<typeof setTimeout>
    const agendar = () => {
      const ms = dayjs().add(1, 'day').startOf('day').diff(dayjs()) + 1000
      timer = setTimeout(() => {
        atualizar()
        agendar()
      }, ms)
    }
    agendar()

    // celular suspende timers em segundo plano: reavalia ao voltar para o app
    const onVisible = () => document.visibilityState === 'visible' && atualizar()
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [refreshSession])

  const mapa = user?.motorista?.mapa
  return isMapaAtivo(mapa) ? mapa : null
}
