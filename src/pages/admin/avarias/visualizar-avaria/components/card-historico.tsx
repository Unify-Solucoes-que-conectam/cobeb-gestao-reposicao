import { Card, CardContent } from '@/components/ui/card'
import dayjs from '@/lib/dayjs'
import { Avaria } from '@/types/consults'
import { CheckCircle2Icon, CircleDotIcon, HistoryIcon, MessageCircleIcon, PackageCheckIcon, XCircleIcon } from 'lucide-react'
import { useMemo } from 'react'

interface CardHistoricoProps {
  avaria: Avaria
}

type EventoHistorico = {
  id: string
  titulo: string
  descricao: string
  data: string
  cor: string
  icon: typeof CircleDotIcon
  ordem: number
}

export default function CardHistorico({ avaria }: CardHistoricoProps) {
  const eventos = useMemo(() => {
    const historico: EventoHistorico[] = []

    historico.push({
      id: `registro-${avaria.id}`,
      titulo: 'Registrada e enviada pelo motorista',
      descricao: avaria.motorista?.nome ?? 'Motorista não informado',
      data: avaria.created_at ?? avaria.data_emissao,
      cor: 'text-slate-500',
      icon: CircleDotIcon,
      ordem: 1,
    })

    if (['aprovada', 'trocada'].includes(avaria.status)) {
      historico.push({
        id: `aprovacao-${avaria.id}`,
        titulo: 'Avaria aprovada',
        descricao: avaria.aprovador?.nome ? `Por ${avaria.aprovador.nome}` : 'Aprovada pelo monitoramento',
        data: avaria.data_aprovacao ?? avaria.updated_at ?? avaria.data_emissao,
        cor: 'text-emerald-600',
        icon: CheckCircle2Icon,
        ordem: 2,
      })
    }

    if (avaria.status === 'reprovada') {
      historico.push({
        id: `reprovacao-${avaria.id}`,
        titulo: 'Avaria reprovada',
        descricao: avaria.motivo_reprovacao || 'Sem motivo informado',
        data: avaria.data_aprovacao ?? avaria.updated_at ?? avaria.data_emissao,
        cor: 'text-red-600',
        icon: XCircleIcon,
        ordem: 2,
      })
    }

    const trocas = new Map<string, EventoHistorico & { quantidade: number, produtos: Set<string>, dataOperacao: string, motivo?: string | null, correcoes?: number, responsavel?: string | null }>()
    avaria.itens.forEach((item) => {
      item.trocas?.forEach((troca) => {
        const existente = trocas.get(troca.id)
        if (existente) {
          existente.quantidade += troca.quantidade
          existente.produtos.add(item.produto.descricao)
          return
        }

        trocas.set(troca.id, {
          id: `troca-${troca.id}`,
          titulo: troca.operacao === '39' ? 'Inversão registrada' : 'Troca registrada',
          descricao: '',
          data: troca.created_at || troca.data_operacao,
          cor: 'text-violet-600',
          icon: PackageCheckIcon,
          ordem: 4,
          quantidade: troca.quantidade,
          produtos: new Set([item.produto.descricao]),
          dataOperacao: troca.data_operacao,
          motivo: troca.motivo_parcial,
          correcoes: troca.correcoes,
          responsavel: troca.responsavel?.nome,
        })
      })
    })

    trocas.forEach((troca) => {
      const produtos = Array.from(troca.produtos).join(', ')
      troca.descricao = `${troca.quantidade} un. — ${produtos} • Operação em ${dayjs(troca.dataOperacao).format('DD/MM/YYYY')}`
      troca.descricao += troca.responsavel ? ` • Registrada por ${troca.responsavel}` : ' • Responsável não registrado'
      if (troca.correcoes) troca.descricao += ` • ${troca.correcoes} correção(ões)`
      if (troca.motivo) troca.descricao += ` • Motivo: ${troca.motivo}`
      historico.push(troca)
    })

    if (avaria.whatsapp_notification_status === 'sent' && avaria.whatsapp_notification_sent_at) {
      historico.push({
        id: `whatsapp-${avaria.id}`,
        titulo: 'Cliente notificado pelo WhatsApp',
        descricao: avaria.whatsapp_notification_phone ?? 'Número não informado',
        data: avaria.whatsapp_notification_sent_at,
        cor: 'text-emerald-600',
        icon: MessageCircleIcon,
        ordem: 3,
      })
    }

    if (avaria.whatsapp_notification_status === 'failed') {
      historico.push({
        id: `whatsapp-falha-${avaria.id}`,
        titulo: 'Falha na notificação por WhatsApp',
        descricao: avaria.whatsapp_notification_error ?? 'O cliente não recebeu a notificação.',
        data: avaria.updated_at ?? avaria.data_emissao,
        cor: 'text-red-600',
        icon: MessageCircleIcon,
        ordem: 3,
      })
    }

    return historico.sort((a, b) => b.ordem - a.ordem || dayjs(b.data).valueOf() - dayjs(a.data).valueOf())
  }, [avaria])

  const formatarData = (data: string) => {
    const possuiHorario = data.includes('T') || data.includes(':')
    return dayjs(data).format(possuiHorario ? 'DD/MM/YYYY [às] HH:mm' : 'DD/MM/YYYY')
  }

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        <HistoryIcon className="size-4 text-slate-500" />
        Histórico da avaria
      </div>

      <Card className="shadow-none">
        <CardContent className="p-4">
          <div className="space-y-0">
            {eventos.map((evento, index) => {
              const Icon = evento.icon
              return (
                <div key={evento.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {index < eventos.length - 1 && <span className="absolute left-[7px] top-5 h-[calc(100%-0.5rem)] w-px bg-border" />}
                  <Icon className={`relative z-10 mt-0.5 size-4 shrink-0 bg-card ${evento.cor}`} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">{evento.titulo}</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{evento.descricao}</p>
                    <p className="mt-1 text-[10px] text-slate-400">{formatarData(evento.data)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
