import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from '@/lib/dayjs';
import { avariaService } from '@/services/api.service';
import { Avaria } from '@/types/consults';
import {
  CalendarIcon,
  // EyeIcon,
  FileTextIcon,
  LayersIcon,
  MessageCircleIcon,
  TruckIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface AvariaCardProps {
  data: Avaria
  reloadData: () => void;
}

/**
 * Componente AvariaCard
 * Exibe informações de ocorrências com suporte a múltiplos produtos.
 */
export default function AvariaCard({ data, reloadData }: AvariaCardProps) {
  const {
    cliente,
    mapa,
    produtos,
    status,
    notas_fiscais,
    created_at: dataOcorrencia,
  } = data;

  const statusColors = {
    pendente: 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    aprovado: 'bg-green-100 text-green-500 border-green-200 hover:bg-green-200 hover:text-green-500',
    reprovado: 'bg-red-100 text-red-500 border-red-200 hover:bg-red-200 hover:text-red-500'
  };

  const statusLabels = {
    pendente: 'Aguardando Análise',
    aprovado: 'Aprovado',
    reprovado: 'Reprovado'
  };

  // Limite de produtos a serem exibidos antes do "ver mais"
  const MAX_VISIBLE_PRODUCTS = 3;
  const visibleProducts = produtos.slice(0, MAX_VISIBLE_PRODUCTS);
  const remainingCount = produtos.length - MAX_VISIBLE_PRODUCTS;

  /**
   * função para aprovar a avaria
   */
  const handleAprovar = async () => {
    const response = await avariaService.aprovar(data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria aprovada com sucesso!');
      reloadData();
    } else {
      toast.error(response.message || 'Erro ao aprovar avaria');
    }
  }

  /**
   * função para reprovar a avaria
   */
  const handleReprovar = async () => {
    const response = await avariaService.reprovar(data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria reprovada com sucesso!');
      reloadData();
    } else {
      toast.error(response.message || 'Erro ao reprovar avaria');
    }
  }

  return (
    <Card className="overflow-hidden">
      {/* Header do Card */}
      <CardHeader className="p-0 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className='flex-1'>
          <CardTitle className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <Badge className="text-[10px] font-bold bg-slate-800 hover:bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
                Cód. {cliente.codigo}
              </Badge>
              <h3 className="text-base font-bold dark:text-slate-400 truncate uppercase">
                {cliente.nome_fantasia || cliente.razao_social}
              </h3>
            </div>
            <Badge className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
          </CardTitle>
          <CardDescription className='flex gap-2 text-xs px-4 py-2'>
            <span className="flex items-center gap-1 text-slate-400">
              <CalendarIcon size={14} className='text-slate-300' />
              {dayjs(dataOcorrencia).format('DD/MM/YYYY HH:mm')}
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <FileTextIcon size={14} className='text-slate-300' />
              <span className="font-semibold">{notas_fiscais.length}</span> {notas_fiscais.length > 1 ? 'Notas Fiscais' : 'Nota Fiscal'}
            </span>
          </CardDescription>
        </div>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Lista de Produtos */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <LayersIcon size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">Produtos ({produtos.length})</p>
            <div className="space-y-1.5">
              {visibleProducts.map((p, index) => (
                <div key={index} className="flex justify-between items-center text-sm gap-2">
                  <span className="text-slate-500 truncate font-medium" title={p.descricao}>
                    <span className="text-slate-400 font-normal mr-1">[{mapa.motorista.codigo}]</span>
                    {p.descricao}
                  </span>
                  <Badge className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                    {p.quantidade} un
                  </Badge>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="text-[11px] text-blue-600 font-bold mt-1 bg-blue-50/50 inline-block px-1 rounded">
                  + {remainingCount} outros itens registrados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Informações do Motorista */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <TruckIcon size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">{mapa.motorista.cluster.descricao}</p>
            <p className="text-sm font-medium text-slate-500 truncate">
              <span className="text-slate-400 font-normal mr-1">[{mapa.motorista.codigo}]</span>
              {mapa.motorista.nome}
            </p>
            <p className="text-xs text-slate-500 truncate mt-1">
              Mapa: <span className="font-semibold">{mapa.codigo}</span> • {mapa.motorista.filial.descricao}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer / Ações */}
      <CardFooter className="px-4 py-3 flex items-center justify-end gap-2 border-t">
        <Button
          onClick={handleReprovar}
          color='destructive'
          disabled={status !== 'pendente'}
        >
          <MessageCircleIcon size={16} />
          Reprovar
        </Button>
        <Button
          onClick={handleAprovar}
          color='success'
          disabled={status !== 'pendente'}
        >
          <MessageCircleIcon size={16} />
          Aprovar e Notificar Cliente
        </Button>
        {/* <Button
          color="warning"
        >
          <EyeIcon size={20} />
          Visualizar Detalhes
        </Button> */}
      </CardFooter>
    </Card>
  );
};