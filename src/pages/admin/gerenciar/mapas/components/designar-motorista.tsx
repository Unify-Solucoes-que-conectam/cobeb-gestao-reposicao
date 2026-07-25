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
import { mapaService, motoristaService } from "@/services/api.service"
import { Mapa, Motorista } from "@/types/consults"
import { UserPlusIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

interface DesignarMotoristaProps {
  mapa: Mapa
  reload: () => void
}

export default function DesignarMotorista(props: DesignarMotoristaProps) {

  // =============== STATES ===============
  const [motoristas, setMotoristas] = useState<Motorista[]>([])
  const [motoristaSelecionado, setMotoristaSelecionado] = useState<string | undefined>(props.mapa.motorista?.id)
  const [spinners, setSpinners] = useState({ geral: false, designando: false })
  const [open, setOpen] = useState(false)

  /**
   * Consultar avarias do cliente selecionado, filtrando por status (opcional)
   */
  const fetchMotoristas = async ({ signal, status }: { signal?: AbortSignal; status?: string } = {}) => {
    setSpinners((prev) => ({ ...prev, geral: true }));
    const response = await motoristaService.read({ filial_id: props.mapa.filial.id, status, only_without_map: true }, signal);

    if (response.success) {
      setMotoristas(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar motoristas');
    }

    setSpinners((prev) => ({ ...prev, geral: false }));
  }

  /**
   * Função para designar o motorista ao mapa selecionado
   */
  const handleSubmit = async () => {

    if (!motoristaSelecionado) {
      toast.error('Selecione um motorista para designar');
      return;
    }

    setSpinners((prev) => ({ ...prev, designando: true }));
    const response = await mapaService.designarMotorista({ mapaId: props.mapa.id, motoristaId: motoristaSelecionado });

    if (response.success) {
      toast.success('Motorista designado com sucesso');
      setOpen(false);
      props.reload()
    } else {
      toast.error(response.message || 'Erro ao designar motorista');
    }

    setSpinners((prev) => ({ ...prev, designando: false }));
  }

  // ============= Effects ===============
  useEffect(() => {
    
    if (open) {
      fetchMotoristas();
    }

    // limpar motorista selecionado ao fechar o modal
    if (!open) {
      setMotoristaSelecionado(undefined);
    }
  }, [props.mapa.filial.id, open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button color="warning" disabled={props.mapa.motorista != undefined}>
          <UserPlusIcon size={20} />
          Designar motorista
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Designar Motorista</DialogTitle>
          <DialogDescription>
            Designar um motorista para o mapa selecionado.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup>
          <Field>
            <Label htmlFor="motorista">Motorista</Label>
            <Select
              onChange={(value) => setMotoristaSelecionado(value[0])}
              value={motoristaSelecionado ? [motoristaSelecionado] : []}
              disabled={spinners.geral}
              options={motoristas.map((motorista) => ({
                label: motorista.nome,
                value: motorista.id,
                disabled: motorista.status !== 'ativo',
              }))}
            />
          </Field>
        </FieldGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={spinners.designando}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-500" disabled={!motoristaSelecionado || props.mapa.motorista?.id === motoristaSelecionado || spinners.geral || spinners.designando} loading={spinners.designando}>
            { spinners.designando ? 'Designando motorista...' : 'Designar motorista' }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
