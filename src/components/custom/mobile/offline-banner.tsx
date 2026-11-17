import { useState } from 'react'

import { CloudOffIcon, RefreshCwIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useIsOnline, useOutbox } from '@/hooks/use-offline'
import { discardOp, flushOutbox, retryOp, type OutboxOp } from '@/lib/offline/outbox'

function describe(op: OutboxOp) {
  if (op.type === 'create') {
    return `Registro de avaria — NF ${op.meta.notaFiscalNumero || '—'}`
  }
  return `Envio para análise — NF ${op.notaFiscalNumero || '—'}`
}

/**
 * Faixa fixa no topo do app do motorista:
 *  - avisa que está sem conexão (trabalhando com dados salvos no aparelho);
 *  - mostra quantos registros aguardam sincronização;
 *  - lista os que o servidor recusou, permitindo tentar de novo ou descartar.
 */
export function OfflineBanner() {
  const online = useIsOnline()
  const ops = useOutbox()
  const [open, setOpen] = useState(false)

  const pending = ops.filter((o) => o.status === 'pending')
  const failed = ops.filter((o) => o.status === 'error')

  if (online && ops.length === 0) return null

  const tone = failed.length > 0 ? 'bg-red-600' : online ? 'bg-blue-600' : 'bg-amber-600'

  let text: string
  if (!online) {
    text =
      pending.length > 0
        ? `Sem conexão — ${pending.length} registro(s) serão enviados ao reconectar`
        : 'Sem conexão — usando dados salvos no aparelho'
  } else if (pending.length > 0) {
    text = `Sincronizando ${pending.length} registro(s)...`
  } else {
    text = `${failed.length} registro(s) não puderam ser enviados`
  }

  return (
    <div className={`${tone} shrink-0 text-white text-xs`} role='status'>
      <button
        type='button'
        className='flex w-full items-center gap-2 px-4 py-1.5 text-left'
        onClick={() => ops.length > 0 && setOpen((v) => !v)}
      >
        {online ? <RefreshCwIcon className='size-3.5 shrink-0' /> : <CloudOffIcon className='size-3.5 shrink-0' />}
        <span className='flex-1 font-medium'>{text}</span>
        {ops.length > 0 && <span className='underline'>{open ? 'Ocultar' : 'Detalhes'}</span>}
      </button>

      {open && ops.length > 0 && (
        <ul className='space-y-2 bg-black/20 px-4 py-2'>
          {ops.map((op) => (
            <li key={op.id} className='flex items-center justify-between gap-2'>
              <div className='min-w-0'>
                <p className='truncate font-semibold'>{describe(op)}</p>
                <p className='truncate opacity-80'>
                  {op.status === 'error' ? op.error || 'Recusado pelo servidor' : 'Aguardando conexão'}
                </p>
              </div>

              {op.status === 'error' && (
                <div className='flex shrink-0 gap-1'>
                  <Button size='sm' variant='outline' color='neutral' className='h-7 px-2 text-xs' onClick={() => retryOp(op.id)}>
                    Tentar de novo
                  </Button>
                  <Button size='sm' variant='solid' color='destructive' className='h-7 px-2 text-xs' onClick={() => discardOp(op.id)}>
                    Descartar
                  </Button>
                </div>
              )}
            </li>
          ))}

          {online && pending.length > 0 && (
            <li>
              <Button size='sm' variant='outline' color='neutral' className='h-7 px-2 text-xs' onClick={() => flushOutbox()}>
                Sincronizar agora
              </Button>
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
