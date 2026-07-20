import { Spinners } from "@/components/custom/avaria-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avaria } from "@/types/consults";
import { EyeIcon } from "lucide-react";
import CardNotasFiscais from "./components/card-notas-fiscais";
import CardContextoRota from "./components/card-contexto-rota";
import CardEvidencias from "./components/card-evidencias";

interface VisualizarAvariaProps {
  spinners: Spinners
  avaria: Avaria
}

export default function VisualizarAvaria(props: VisualizarAvariaProps) {

  // ======================= Variáveis ====================
  const statusLabels = {
    pendente: 'Aguardando Análise',
    aprovada: 'Aprovada',
    reprovada: 'Reprovada'
  };

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    aprovada: 'bg-green-100 text-green-500 border-green-200 hover:bg-green-200 hover:text-green-500',
    reprovada: 'bg-red-100 text-red-500 border-red-200 hover:bg-red-200 hover:text-red-500'
  };

  // ======================= Funções ====================
  const formatAdress = (street: string, neighborhood: string, city: string, state: string) => {
    return `${street}, ${neighborhood} - ${city}/${state}`;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          color="warning"
          disabled={props.spinners.reprovando || props.spinners.aprovando}
        >
          <EyeIcon size={20} className="mr-2" />
          Visualizar Detalhes
        </Button>
      </DialogTrigger>

      <DialogContent className='md:max-w-6xl'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-3'>
            Detalhes da Avaria #{props.avaria.id}
            <Badge className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusColors[props.avaria.status]}`}>
              {statusLabels[props.avaria.status]} 
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {props.avaria.cliente.razao_social} • {formatAdress(
              props.avaria.cliente.endereco,
              props.avaria.cliente.bairro,
              props.avaria.cliente.cidade,
              props.avaria.cliente.uf
            )}
          </DialogDescription>
        </DialogHeader>

        <div className='flex flex-wrap gap-4'>
          <CardNotasFiscais notasFiscais={props.avaria.notas_fiscais} />
          <div className='w-full md:w-90 flex flex-col gap-4'>
            <CardContextoRota mapa={props.avaria.mapa} />
            <CardEvidencias anexos={props.avaria.anexos} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}