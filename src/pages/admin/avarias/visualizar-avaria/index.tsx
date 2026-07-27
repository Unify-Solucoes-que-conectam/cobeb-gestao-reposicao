import MotivoReprovacao from "@/components/custom/motivo-reprovacao";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { avariaService } from "@/services/api.service";
import { Avaria } from "@/types/consults";
import { CheckIcon, EyeIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import CardContextoRota from "./components/card-contexto-rota";
import CardEvidencias from "./components/card-evidencias";
import CardNotaFiscal from "./components/card-nota-fiscal";

interface Spinners {
  aprovando: boolean;
  reprovando: boolean;
}

interface VisualizarAvariaProps {
  avaria: Avaria
  reload: () => void
}

export default function VisualizarAvaria(props: VisualizarAvariaProps) {

  // ======================= States ====================
  const [open, setOpen] = useState(false);
  const [spinners, setSpinners] = useState<Spinners>({
    aprovando: false,
    reprovando: false,
  })

  // ======================= Variáveis ====================
  const statusColors = {
    pendente: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:text-gray-500',
    aguardando_aprovacao: 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    aprovada: 'bg-green-100 text-green-500 border-green-200 hover:bg-green-200 hover:text-green-500',
    reprovada: 'bg-red-100 text-red-500 border-red-200 hover:bg-red-200 hover:text-red-500',
    trocada: 'bg-violet-100 text-violet-500 border-violet-200 hover:bg-violet-200 hover:text-blue-500'
  };

  const statusLabels = {
    pendente: 'Aguardando Envio',
    aguardando_aprovacao: 'Aguardando Aprovação',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada',
    trocada: 'Trocada'
  };

  // ======================= Funções ====================
  const formatAdress = (street: string, neighborhood: string, city: string, state: string) => {
    return `${street}, ${neighborhood} - ${city}/${state}`;
  }

  /**
   * função para aprovar a avaria
   */
  const handleAprovar = async () => {
    setSpinners(prev => ({ ...prev, aprovando: true }));
    const response = await avariaService.aprovar(props.avaria.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria aprovada com sucesso!');
      props.reload?.();
    } else {
      toast.error(response.message || 'Erro ao aprovar avaria');

      if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') {
        props.reload?.();
      }
    }

    setSpinners(prev => ({ ...prev, aprovando: false }));
  }

  /**
   * função para reprovar a avaria
   */
  const handleReprovar = async (motivo: string) => {
    setSpinners(prev => ({ ...prev, reprovando: true }));
    const response = await avariaService.reprovar(props.avaria.id, motivo);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria reprovada com sucesso!');
      props.reload?.();
    } else {
      toast.error(response.message || 'Erro ao reprovar avaria');

      if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') {
        props.reload?.();
      }
    }

    setSpinners(prev => ({ ...prev, reprovando: false }));
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          color="warning"
          disabled={spinners.reprovando || spinners.aprovando}
        >
          <EyeIcon size={20} className="mr-2" />
          Visualizar Detalhes
        </Button>
      </DialogTrigger>

      <DialogContent className='md:max-w-5xl max-h-[calc(100vh-4rem)] p-0 flex flex-col'>
        <DialogHeader className="border-b p-3">
          <DialogTitle className='flex items-center gap-3'>
            Detalhes da Avaria #{props.avaria.id}
            <Badge className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusColors[props.avaria.status]}`}>
              {statusLabels[props.avaria.status]}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {props.avaria.cliente?.razao_social} • {formatAdress(
              props.avaria.cliente?.endereco || '',
              props.avaria.cliente?.bairro || '',
              props.avaria.cliente?.cidade || '',
              props.avaria.cliente?.uf || ''
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-wrap gap-4 p-3 overflow-hidden'>
          <CardNotaFiscal avariaId={props.avaria.id} notaFiscal={props.avaria.nota_fiscal} itens={props.avaria.itens} canEdit={props.avaria.status === 'aguardando_aprovacao'} />
          <div className='w-full md:w-90 flex flex-col gap-4'>
            <CardContextoRota motorista={props.avaria.motorista!} />
            <CardEvidencias avaria={props.avaria} anexos={props.avaria.anexos} />
          </div>
        </div>

        {
          props.avaria.status === 'aguardando_aprovacao' && (
            <DialogFooter className="border-t p-3">
              {/* Botões de Ação (Aparecem apenas quando pendente e para perfis com permissão) */}
              <MotivoReprovacao
                loading={spinners.reprovando}
                handleConfirm={(motivo) => handleReprovar(motivo)}
              >
                <Button
                  color="destructive"
                  disabled={spinners.reprovando || spinners.aprovando}
                >
                  <XIcon size={16} />
                  Reprovar
                </Button>
              </MotivoReprovacao>

              <Button
                onClick={handleAprovar}
                color="success"
                disabled={spinners.aprovando || spinners.reprovando}
                loading={spinners.aprovando}
              >
                {!spinners.aprovando && <CheckIcon size={16} />}
                {spinners.aprovando ? 'Processando...' : 'Aprovar'}
              </Button>
            </DialogFooter>
          )
        }
      </DialogContent>
    </Dialog>
  )
}