import { Select } from "@/components/custom/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Tooltip } from "@/components/ui/tooltip"
import { mapaService, motoristaService } from "@/services/api.service"
import { Mapa, Motorista } from "@/types/consults"
import { RefreshCwIcon, UserPlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DesignarMotoristaProps {
  mapa: Mapa
  reload: () => void
  /** motivo pelo qual a ação está indisponível (o botão aparece desabilitado) */
  bloqueio?: string
}

/**
 * Designa um motorista ao mapa ou troca o motorista já designado.
 * Lista apenas motoristas ativos da mesma filial (revenda) do mapa.
 */
export default function DesignarMotorista(props: DesignarMotoristaProps) {

  const motoristaAtual = props.mapa.motorista
  const trocando = !!motoristaAtual

  // =============== STATES ===============
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<string | undefined>(motoristaAtual?.id)
  const [spinners, setSpinners] = useState({ geral: false, designando: false })
  const [open, setOpen] = useState(false)

  /**
   * Consultar motoristas ativos da filial do mapa
   */
  const fetchMotoristas = async ({ signal }: { signal?: AbortSignal } = {}) => {
    setSpinners((prev) => ({ ...prev, geral: true }));

    try {
      const response = await motoristaService.read({ filial: props.mapa.filial.id, status: 'ativo' }, signal);

      if (response.success) {
        setMotoristas(response.data);
      } else {
        toast.error(response.message || 'Erro ao consultar motoristas');
      }
    } catch {
      if (!signal?.aborted) toast.error('Erro ao consultar motoristas');
    } finally {
      setSpinners((prev) => ({ ...prev, geral: false }));
    }
  }

  /**
   * Função para designar (ou trocar) o motorista do mapa selecionado
   */
  const handleSubmit = async () => {

    if (!motoristaSelecionado) {
      toast.error('Selecione um motorista para designar');
      return;
    }

    setSpinners((prev) => ({ ...prev, designando: true }));

    try {
      const response = await mapaService.designarMotorista({ mapaId: props.mapa.id, motoristaId: motoristaSelecionado });

      if (response.success) {
        toast.success(response.message || (trocando ? 'Motorista alterado com sucesso' : 'Motorista designado com sucesso'));
        setOpen(false);
        props.reload()
      } else {
        toast.error(response.message || 'Erro ao designar motorista');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Erro ao designar motorista');
    } finally {
      setSpinners((prev) => ({ ...prev, designando: false }));
    }
  }

  // ============= Effects ===============
  useEffect(() => {
    if (!open) return;

    // ao abrir, parte do motorista atual (se houver)
    setMotoristaSelecionado(motoristaAtual?.id);

    const controller = new AbortController();
    fetchMotoristas({ signal: controller.signal });
    return () => controller.abort();
  }, [props.mapa.filial.id, open]);

  // garante que o motorista atual apareça na lista mesmo se estiver inativo
  const opcoes = [
    ...(motoristaAtual && !motoristas.some((m) => m.id === motoristaAtual.id) ? [motoristaAtual] : []),
    ...motoristas,
  ].map((motorista) => ({
    label: `[${motorista.codigo}] ${motorista.nome}${motorista.id === motoristaAtual?.id ? ' (atual)' : ''}`,
    value: motorista.id,
  }));

  // botão desabilitado não dispara eventos: o span mantém o tooltip com o motivo
  if (props.bloqueio) {
    return (
      <Tooltip content={props.bloqueio}>
        <span tabIndex={0} className="inline-flex">
          <Button color="warning" size="icon" disabled aria-label={trocando ? 'Trocar motorista' : 'Designar motorista'}>
            {trocando ? <RefreshCwIcon /> : <UserPlusIcon />}
          </Button>
        </span>
      </Tooltip>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip content={trocando ? 'Trocar motorista' : 'Designar motorista'} color="warning">
        <DialogTrigger asChild>
          <Button color="warning" size="icon" aria-label={trocando ? 'Trocar motorista' : 'Designar motorista'}>
            {trocando ? <RefreshCwIcon /> : <UserPlusIcon />}
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{trocando ? 'Trocar Motorista' : 'Designar Motorista'}</DialogTitle>
          <DialogDescription>
            {trocando
              ? `O mapa ${props.mapa.codigo} está com ${motoristaAtual?.nome}. Selecione o novo motorista responsável.`
              : 'Designar um motorista para o mapa selecionado.'}
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="motorista">Motorista</Label>
            <Select
              onChange={(value) => setMotoristaSelecionado(value[0])}
              value={motoristaSelecionado ? [motoristaSelecionado] : []}
              disabled={spinners.geral}
              emptyMessage="Nenhum motorista ativo nesta filial."
              options={opcoes}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={spinners.designando}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-500" disabled={!motoristaSelecionado || motoristaAtual?.id === motoristaSelecionado || spinners.geral || spinners.designando} loading={spinners.designando}>
            {spinners.designando
              ? (trocando ? 'Trocando motorista...' : 'Designando motorista...')
              : (trocando ? 'Trocar motorista' : 'Designar motorista')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
