import MotivoReprovacao from '@/components/custom/motivo-reprovacao'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { avariaService } from '@/services/api.service'
import { Avaria } from '@/types/consults'
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CheckIcon,
  Clock3Icon,
  EyeIcon,
  MapPinIcon,
  MessageCircleIcon,
  SendIcon,
  UserIcon,
  XIcon,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import CardContextoRota from './components/card-contexto-rota'
import CardEvidencias from './components/card-evidencias'
import CardHistorico from './components/card-historico'
import CardNotaFiscal from './components/card-nota-fiscal'

interface Spinners {
  aprovando: boolean
  reprovando: boolean
}
interface VisualizarAvariaProps {
  avaria: Avaria
  reload: () => void
}

const statusColors = {
  pendente: 'border-slate-200 bg-slate-100 text-slate-600',
  aguardando_aprovacao: 'border-amber-200 bg-amber-50 text-amber-700',
  aprovada: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  reprovada: 'border-red-200 bg-red-50 text-red-700',
  trocada: 'border-violet-200 bg-violet-50 text-violet-700',
}

const statusLabels = {
  pendente: 'Aguardando envio',
  aguardando_aprovacao: 'Aguardando aprovação',
  aprovada: 'Aprovada',
  reprovada: 'Reprovada',
  trocada: 'Trocada',
}

export default function VisualizarAvaria({ avaria, reload }: VisualizarAvariaProps) {
  const [open, setOpen] = useState(false)
  const [spinners, setSpinners] = useState<Spinners>({ aprovando: false, reprovando: false })
  const canDecide = avaria.status === 'aguardando_aprovacao'

  const handleAprovar = async () => {
    if (!canDecide) return
    setSpinners((current) => ({ ...current, aprovando: true }))

    try {
      const response = await avariaService.aprovar(avaria.id)
      if (response.success) {
        toast.success('Avaria aprovada com sucesso!')
        reload()
      } else {
        toast.error(response.message || 'Erro ao aprovar avaria')
        if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') reload()
      }
    } finally {
      setSpinners((current) => ({ ...current, aprovando: false }))
    }
  }

  const handleReprovar = async (motivo: string) => {
    if (!canDecide) return
    setSpinners((current) => ({ ...current, reprovando: true }))

    try {
      const response = await avariaService.reprovar(avaria.id, motivo)
      if (response.success) {
        toast.success('Avaria reprovada com sucesso!')
        reload()
      } else {
        toast.error(response.message || 'Erro ao reprovar avaria')
        if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') reload()
      }
    } finally {
      setSpinners((current) => ({ ...current, reprovando: false }))
    }
  }

  const endereco = [
    avaria.cliente?.endereco,
    avaria.cliente?.bairro,
    [avaria.cliente?.cidade, avaria.cliente?.uf].filter(Boolean).join('/'),
  ].filter(Boolean).join(' • ')

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="warning" disabled={spinners.reprovando || spinners.aprovando}>
          <EyeIcon className="mr-2 size-4" />
          Visualizar detalhes
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[92vh] w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden p-0 md:max-w-6xl">
        <DialogHeader className="border-b bg-slate-50/70 px-5 py-4 pr-12 dark:bg-slate-950/40">
          <DialogTitle className="flex flex-wrap items-center gap-2 text-base">
            Avaria #{avaria.id}
            <Badge className={`rounded-full border px-2.5 py-0.5 text-[10px] ${statusColors[avaria.status]}`}>
              {statusLabels[avaria.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="flex items-center gap-1 font-medium text-foreground"><UserIcon className="size-3.5 text-slate-400" />{avaria.cliente?.razao_social ?? 'Cliente não informado'}</span>
            {endereco && <span className="flex items-center gap-1"><MapPinIcon className="size-3.5 text-rose-500" />{endereco}</span>}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto p-4 md:p-5">
          <NotificationPanel avaria={avaria} reload={reload} />

          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
            <CardNotaFiscal
              avariaId={avaria.id}
              notaFiscal={avaria.nota_fiscal}
              itens={avaria.itens}
              canEdit={canDecide}
            />

            <div className="space-y-5">
              {avaria.motorista && <CardContextoRota motorista={avaria.motorista} dataRegistro={avaria.created_at ?? avaria.data_emissao} />}
              <CardEvidencias avaria={avaria} anexos={avaria.anexos} />
              <CardHistorico avaria={avaria} />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-auto flex-row justify-end gap-2 border-t bg-slate-50/70 p-4 sm:space-x-0 dark:bg-slate-950/40">
          <DialogClose asChild>
            <Button variant="outline">Fechar</Button>
          </DialogClose>

          <MotivoReprovacao loading={spinners.reprovando} handleConfirm={handleReprovar}>
            <Button
              color="destructive"
              disabled={!canDecide || spinners.reprovando || spinners.aprovando}
              title={canDecide ? 'Reprovar avaria' : 'Esta avaria já foi analisada'}
            >
              <XIcon className="size-4" />
              Reprovar
            </Button>
          </MotivoReprovacao>

          <Button
            onClick={handleAprovar}
            color="success"
            disabled={!canDecide || spinners.aprovando || spinners.reprovando}
            loading={spinners.aprovando}
            title={canDecide ? 'Aprovar avaria' : 'Esta avaria já foi analisada'}
          >
            {!spinners.aprovando && <CheckIcon className="size-4" />}
            {spinners.aprovando ? 'Processando...' : 'Aprovar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NotificationPanel({ avaria, reload }: { avaria: Avaria, reload: () => void }) {
  const isLegacy = avaria.whatsapp_notification_status === null && ['aprovada', 'reprovada'].includes(avaria.status)

  if (avaria.whatsapp_notification_status === 'failed' || isLegacy) {
    return (
      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50/70 p-4 text-red-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-red-100"><AlertTriangleIcon className="size-4" /></span>
          <div>
            <p className="text-sm font-semibold">{isLegacy ? 'Envio anterior sem acompanhamento' : 'O cliente não recebeu a notificação'}</p>
            <p className="mt-1 text-xs leading-relaxed text-red-700">{avaria.whatsapp_notification_error || 'Confira o número do cliente e reenvie a mensagem pelo WhatsApp.'}</p>
          </div>
        </div>
        <CorrigirWhatsAppDialog avaria={avaria} reload={reload} />
      </div>
    )
  }

  if (avaria.whatsapp_notification_status === 'pending') {
    return (
      <div className="mb-5 flex gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-blue-800">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-100"><Clock3Icon className="size-4" /></span>
        <div>
          <p className="text-sm font-semibold">Notificação em processamento</p>
          <p className="mt-1 text-xs text-blue-700">O envio para {avaria.whatsapp_notification_phone || 'o número informado'} está na fila do WhatsApp.</p>
        </div>
      </div>
    )
  }

  if (avaria.whatsapp_notification_status === 'sent') {
    return (
      <div className="mb-5 flex gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-emerald-800">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100"><CheckCircle2Icon className="size-4" /></span>
        <div>
          <p className="text-sm font-semibold">Cliente notificado pelo WhatsApp</p>
          <p className="mt-1 text-xs text-emerald-700">Mensagem enviada para {avaria.whatsapp_notification_phone || 'o contato principal do cliente'}.</p>
        </div>
      </div>
    )
  }

  return null
}

function CorrigirWhatsAppDialog({ avaria, reload }: { avaria: Avaria, reload: () => void }) {
  const [open, setOpen] = useState(false)
  const [phone, setPhone] = useState(avaria.whatsapp_notification_phone ?? '')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    setPhone(avaria.whatsapp_notification_phone ?? '')
  }, [avaria.whatsapp_notification_phone])

  const handleRetry = async () => {
    setSending(true)
    try {
      const response = await avariaService.retryWhatsApp(avaria.id, phone)
      if (response.success) {
        toast.success(response.message)
        setOpen(false)
        reload()
      } else {
        toast.error(response.message || 'Não foi possível reenviar a notificação.')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="shrink-0 gap-2 bg-red-700 text-white hover:bg-red-800">
          <MessageCircleIcon className="size-4" />
          Corrigir número e reenviar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md gap-0 p-0">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle className="flex items-center gap-2 text-base">
            <MessageCircleIcon className="size-5 text-emerald-600" />
            Reenviar notificação ao cliente
          </DialogTitle>
          <DialogDescription className="pt-2 text-xs leading-relaxed">
            Informe o número atualizado de <strong>{avaria.cliente?.razao_social ?? 'cliente'}</strong> para reenviar a decisão da avaria #{avaria.id}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 px-5 py-5">
          <Label htmlFor={`whatsapp-${avaria.id}`}>Telefone / WhatsApp</Label>
          <Input
            id={`whatsapp-${avaria.id}`}
            inputMode="tel"
            placeholder="Ex.: 37999999999"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
          />
          <p className="text-[11px] text-muted-foreground">O número será salvo como WhatsApp principal do cliente.</p>
        </div>

        <DialogFooter className="flex-row justify-end gap-2 border-t bg-slate-50 p-4 sm:space-x-0 dark:bg-slate-950/40">
          <DialogClose asChild><Button variant="ghost">Cancelar</Button></DialogClose>
          <Button onClick={handleRetry} loading={sending} disabled={sending || phone.trim() === ''} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            {!sending && <SendIcon className="size-4" />}
            Enviar pelo WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
