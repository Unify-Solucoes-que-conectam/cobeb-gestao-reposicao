import { Spinners } from "@/components/custom/avaria-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avaria } from "@/types/consults";
import { EyeIcon } from "lucide-react";
import { useState } from "react";
import CardContextoRota from "./components/card-contexto-rota";
import CardEvidencias from "./components/card-evidencias";
import CardNotaFiscal from "./components/card-nota-fiscal";

interface VisualizarAvariaProps {
  spinners: Spinners
  avaria: Avaria
  reload: () => void
}

export default function VisualizarAvaria(props: VisualizarAvariaProps) {

  // ======================= States ====================
  const [open, setOpen] = useState(false);

  // ======================= Variáveis ====================
  const statusColors = {
    pendente: 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200 hover:text-gray-500',
    enviada: 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    aprovada: 'bg-green-100 text-green-500 border-green-200 hover:bg-green-200 hover:text-green-500',
    reprovada: 'bg-red-100 text-red-500 border-red-200 hover:bg-red-200 hover:text-red-500',
    trocada: 'bg-violet-100 text-violet-500 border-violet-200 hover:bg-violet-200 hover:text-blue-500'
  };

  const statusLabels = {
    pendente: 'Aguardando Envio',
    enviada: 'Enviada',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada',
    trocada: 'Trocada'
  };

  // ======================= Funções ====================
  const formatAdress = (street: string, neighborhood: string, city: string, state: string) => {
    return `${street}, ${neighborhood} - ${city}/${state}`;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          color="warning"
          disabled={props.spinners.reprovando || props.spinners.aprovando}
        >
          <EyeIcon size={20} className="mr-2" />
          Visualizar Detalhes
        </Button>
      </DialogTrigger>

      <DialogContent className='md:max-w-5xl max-h-[calc(100vh-4rem)]'>
        <DialogHeader className="border-b pb-3">
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

        <div className='flex flex-wrap gap-4'>
          <CardNotaFiscal avariaId={props.avaria.id} notaFiscal={props.avaria.nota_fiscal} itens={props.avaria.itens} />
          <div className='w-full md:w-90 flex flex-col gap-4'>
            <CardContextoRota motorista={props.avaria.motorista!} />
            <CardEvidencias avaria={props.avaria} anexos={props.avaria.anexos} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}