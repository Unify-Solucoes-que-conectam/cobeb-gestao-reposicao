import { Card, CardContent } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { Motorista } from '@/types/consults'
import { RouteIcon, TruckIcon } from 'lucide-react'

interface CardContextoRotaProps {
  motorista: Motorista
  dataRegistro: string
}
export default function CardContextoRota({ motorista, dataRegistro }: CardContextoRotaProps) {
  const initials = motorista.nome.split(' ').filter(Boolean).slice(0, 2).map((name) => name[0]).join('')

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        <span className="rounded-md bg-violet-100 p-1.5 text-violet-700 dark:bg-violet-950"><RouteIcon className="size-4" /></span>
        Contexto da rota
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800">
              {initials || <TruckIcon className="size-4" />}
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase text-slate-400">Motorista responsável</p>
              <p className="truncate text-sm font-semibold">{motorista.nome}</p>
              <p className="truncate text-[11px] text-muted-foreground">{motorista.cluster?.descricao ?? 'Cluster não informado'} • {motorista.filial?.descricao ?? 'Filial não informada'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t pt-3">
            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <p className="text-[9px] font-bold uppercase text-slate-400">Mapa de rota</p>
              <p className="mt-1 text-xs font-semibold">{motorista.mapa?.codigo ? `#${motorista.mapa.codigo}` : 'Não informado'}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <p className="text-[9px] font-bold uppercase text-slate-400">Registro</p>
              <p className="mt-1 text-xs font-semibold">{dayjs(dataRegistro).format('DD/MM/YYYY HH:mm')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
