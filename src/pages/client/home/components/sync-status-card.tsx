import { AlertTriangleIcon, CheckCircle2Icon, CloudDownloadIcon, CloudOffIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useIsOnline, useSyncStatus } from '@/hooks/use-offline'
import dayjs from '@/lib/dayjs'
import { prefetchMapa } from '@/lib/offline/prefetch'
import { cn } from '@/lib/utils'

/** Após esse tempo sem atualizar, avisamos que os dados offline podem estar velhos. */
const STALE_AFTER_HOURS = 12

/**
 * Mostra se os dados do mapa já estão salvos no aparelho para uso sem internet:
 * baixando (com progresso), pronto (com horário), incompleto/erro ou ainda não baixado.
 */
export default function SyncStatusCard({ mapaId }: { mapaId?: string }) {
  const status = useSyncStatus()
  const online = useIsOnline()

  const last = status.last && status.last.mapaId === mapaId ? status.last : null
  const ageHours = last ? dayjs().diff(dayjs(last.at), 'hour') : 0
  const stale = !!last && ageHours >= STALE_AFTER_HOURS

  type View = { tone: 'blue' | 'green' | 'amber' | 'red'; icon: typeof CheckCircle2Icon; title: string; text: string; retry?: boolean }

  let view: View
  if (status.phase === 'running') {
    view = {
      tone: 'blue',
      icon: CloudDownloadIcon,
      title: 'Baixando dados para uso offline…',
      text: status.total > 0 ? `${status.done} de ${status.total} clientes` : 'Preparando…',
    }
  } else if (status.phase === 'error') {
    view = {
      tone: 'amber',
      icon: AlertTriangleIcon,
      title: 'Download incompleto',
      text: `${status.message ?? 'Alguns dados não foram baixados.'}${status.failedNames.length ? ` Faltam: ${status.failedNames.slice(0, 3).join(', ')}${status.failedNames.length > 3 ? '…' : ''}.` : ''} Não saia sem internet antes de concluir.`,
      retry: true,
    }
  } else if (last && !stale) {
    view = {
      tone: 'green',
      icon: CheckCircle2Icon,
      title: 'Pronto para uso offline',
      text: `${last.clientes} cliente(s) • atualizado ${dayjs(last.at).format('DD/MM [às] HH:mm')}`,
    }
  } else if (last && stale) {
    view = {
      tone: 'amber',
      icon: AlertTriangleIcon,
      title: 'Dados offline desatualizados',
      text: `Última atualização há ${ageHours}h (${dayjs(last.at).format('DD/MM HH:mm')}).`,
      retry: online,
    }
  } else if (!online) {
    view = {
      tone: 'red',
      icon: CloudOffIcon,
      title: 'Dados offline não baixados',
      text: 'Conecte-se à internet para baixar os dados do mapa.',
    }
  } else {
    view = {
      tone: 'amber',
      icon: CloudDownloadIcon,
      title: 'Dados offline ainda não baixados',
      text: 'Aguarde o download ou toque em atualizar.',
      retry: true,
    }
  }

  const tones = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }

  const Icon = view.icon
  const progress = status.phase === 'running' && status.total > 0 ? (status.done / status.total) * 100 : 0

  return (
    <div className={cn('rounded-xl border px-3 py-2 text-xs', tones[view.tone])} role='status'>
      <div className='flex items-center gap-2'>
        <Icon className={cn('size-5 shrink-0', status.phase === 'running' && 'animate-pulse')} />
        <div className='min-w-0 flex-1'>
          <p className='font-semibold'>{view.title}</p>
          <p className='opacity-90'>{view.text}</p>
        </div>

        {(view.retry || (online && status.phase === 'idle' && last)) && (
          <Button
            size='icon'
            variant='outline'
            color='neutral'
            className='size-8 shrink-0'
            aria-label='Atualizar dados offline'
            onClick={() => void prefetchMapa(mapaId, { force: true })}
          >
            <RefreshCwIcon className='size-4' />
          </Button>
        )}
      </div>

      {status.phase === 'running' && (
        <div className='mt-2 h-1.5 overflow-hidden rounded-full bg-blue-200'>
          <div className='h-full bg-blue-600 transition-all' style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  )
}
