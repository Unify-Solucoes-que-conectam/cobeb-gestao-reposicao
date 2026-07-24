import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import dayjs from '@/lib/dayjs';
import VisualizarAvaria from '@/pages/admin/avarias/visualizar-avaria';
import { avariaService } from '@/services/api.service';
import { Avaria } from '@/types/consults';
import {
  AlertTriangleIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  FileTextIcon,
  LayersIcon,
  MessageCircleIcon,
  TrashIcon,
  TruckIcon,
  XIcon
} from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface AvariaCardProps {
  data: Avaria
  reloadData?: () => void;
}

export type Spinners = {
  aprovando: boolean;
  reprovando: boolean;
  enviando: boolean;
  removendo: boolean;
}

/**
 * Componente AvariaCard
 * Exibe informações de ocorrências com suporte a múltiplos produtos.
 */
export default function AvariaCard(props: AvariaCardProps) {

  // ======================= Hooks ====================
  const { user } = useAuth();

  // ======================= States ===================
  const [spinners, setSpinners] = useState<Spinners>({
    aprovando: false,
    reprovando: false,
    enviando: false,
    removendo: false
  })
  const [copied, setCopied] = useState(false);

  // ======================= Variáveis =================
  const items = props.data.itens;

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

  const produtoStatusColor = {
    '5': 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    '39': 'bg-violet-100 text-violet-500 border-violet-200 hover:bg-violet-200 hover:text-blue-500',
  };

  const produtoStatusLabels = {
    '5': 'Avariado',
    '39': 'Inversão',
  };

  // Limite de produtos a serem exibidos antes do "ver mais"
  const MAX_VISIBLE_PRODUCTS = 3;
  const visibleProducts = items.map(item => item.produto).flat().slice(0, MAX_VISIBLE_PRODUCTS);
  const remainingCount = items.map(item => item.produto).flat().length - MAX_VISIBLE_PRODUCTS;

  /**
   * função para aprovar a avaria
   */
  const handleAprovar = async () => {
    setSpinners(prev => ({ ...prev, aprovando: true }));
    const response = await avariaService.aprovar(props.data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria aprovada com sucesso!');
      props.reloadData?.();
    } else {
      toast.error(response.message || 'Erro ao aprovar avaria');
      
      if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') {
        props.reloadData?.();
      }
    }

    setSpinners(prev => ({ ...prev, aprovando: false }));
  }

  /**
   * função para reprovar a avaria
   */
  const handleReprovar = async () => {
    setSpinners(prev => ({ ...prev, reprovando: true }));
    const response = await avariaService.reprovar(props.data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria reprovada com sucesso!');
      props.reloadData?.();
    } else {
      toast.error(response.message || 'Erro ao reprovar avaria');
      
      if (response.error_code === 'WHATSAPP_NOTIFICATION_FAILED') {
        props.reloadData?.();
      }
    }

    setSpinners(prev => ({ ...prev, reprovando: false }));
  }

  /**
   * função para enviar a avaria
   */
  const handleEnviar = async () => {
    setSpinners(prev => ({ ...prev, enviando: true }));
    const response = await avariaService.enviar(props.data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria enviada com sucesso!');
      props.reloadData?.();
    } else {
      toast.error(response.message || 'Erro ao enviar avaria');
    }

    setSpinners(prev => ({ ...prev, enviando: false }));
  }

  /**
   * função para remover a avaria
   */
  const handleRemover = async () => {
    setSpinners(prev => ({ ...prev, removendo: true }));
    const response = await avariaService.remover(props.data.id);
    if (response.success) {
      // Atualizar o status localmente ou refetch os dados
      toast.success('Avaria removida com sucesso!');
      props.reloadData?.();
    } else {
      toast.error(response.message || 'Erro ao remover avaria');
    }

    setSpinners(prev => ({ ...prev, removendo: false }));
  }

  /**
   * Função para copiar o ID da avaria para a área de transferência
   */
  const handleCopyId = () => {
    navigator.clipboard.writeText(props.data.id.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1000); // Reset after 2 seconds
  }

  return (
    <Card className="overflow-hidden">
      {/* Header do Card */}
      <CardHeader className="p-0 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className='flex-1'>
          <CardTitle className="flex items-center justify-between border-b px-4 py-2">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold dark:text-slate-400 truncate flex gap-2 items-center">
                Avaria #{props.data.id}
                {
                  copied ? (
                    <div className="flex items-center gap-1 text-emerald-500 text-xs">
                      <CheckIcon size={14} />
                      <p>Copiado!</p>
                    </div>
                  ) : (
                    <CopyIcon size={14} onClick={handleCopyId} />
                  )
                }
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Badge className={`text-xs font-semibold rounded-md ${statusColors[props.data.status]}`}>
                {statusLabels[props.data.status]}
              </Badge>

              {
                props.data.status === 'pendente' && user?.role === 'motorista' && (
                  <AlertDialog>

                    <AlertDialogTrigger asChild>
                      <Button variant='outline' size='icon'>
                        <TrashIcon size={14} className='text-red-500' />
                      </Button>
                    </AlertDialogTrigger>

                    <AlertDialogContent className="w-[90%] max-w-95 rounded-3xl p-6 bg-white gap-6">

                      <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">
                        <AlertDialogTitle className="text-lg leading-snug font-semibold text-slate-900">
                          Você tem certeza que deseja remover esta avaria?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-xs font-medium text-slate-500">
                          Ao continuar a avaria será removida do sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <AlertDialogFooter className="flex flex-col gap-3 sm:flex-col sm:space-x-0">

                        <AlertDialogCancel className="w-full h-11 mt-0 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white hover:bg-slate-50 shadow-sm">
                          Cancelar
                        </AlertDialogCancel>

                        <Button
                          onClick={handleRemover}
                          disabled={spinners.removendo}
                          loading={spinners.removendo}
                          className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-700 text-white font-semibold shadow-sm"
                        >
                          {spinners.removendo ? 'Removendo Avaria...' : 'Remover Avaria'}
                        </Button>

                      </AlertDialogFooter>

                    </AlertDialogContent>
                  </AlertDialog>
                )
              }
            </div>
          </CardTitle>
          <CardDescription className='flex justify-between text-xs px-4 py-2'>
            <span className="flex gap-2">
              <FileTextIcon size={14} className='text-slate-300' />
              Nota Fiscal: #{props.data.nota_fiscal.numero}
            </span>

            <span className="flex gap-2">
              <CalendarIcon size={14} className='text-slate-300' />
              Registrada em: {dayjs(props.data.data_emissao).format('DD/MM/YYYY HH:mm')}
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
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">Produtos ({items.length})</p>
            <div className="space-y-1.5">
              {visibleProducts.map((p, index) => (
                <div key={index} className="flex justify-between items-center text-sm gap-2">
                  <span className="text-slate-500 truncate font-medium" title={p.descricao}>
                    <span className="text-slate-400 font-normal mr-1">[{p.codigo}]</span>
                    {p.descricao}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Badge className={`text-xs font-semibold rounded-md ${produtoStatusColor[p.tipo_avaria.codigo]}`}>
                      {produtoStatusLabels[p.tipo_avaria.codigo]}
                    </Badge>
                    <Badge className="text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                      {p.quantidade_avariada} un
                    </Badge>
                  </div>
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
        {
          user?.role === 'monitoramento' && props.data.motorista && props.data.motorista.mapa && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-50 rounded-lg shrink-0">
                <TruckIcon size={18} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">{props.data.motorista.cluster.descricao}</p>
                <p className="text-sm font-medium text-slate-500 truncate">
                  <span className="text-slate-400 font-normal mr-1">[{props.data.motorista.mapa.codigo}]</span>
                  {props.data.motorista.nome}
                </p>
                <p className="text-xs text-slate-500 truncate mt-1">
                  Mapa: <span className="font-semibold">{props.data.motorista.mapa.codigo}</span> • {props.data.motorista.filial.descricao}
                </p>
              </div>
            </div>
          )
        }
      </CardContent>

      {/* Footer / Ações */}
      <CardFooter className="px-4 py-3 flex items-center justify-end gap-2 border-t">

        {/* Mensagens de status (Exclusivas para Motorista) */}
        {user?.role === 'motorista' && (
          <>
            {props.data.status === 'pendente' && (
              dayjs(props.data.data_emissao).isBefore(dayjs(), 'day') && !spinners.enviando ? (
                <div className="text-sm w-full text-amber-600 flex gap-2 items-center">
                  <AlertTriangleIcon size={16} className="mr-1" />
                  <p>Envio atrasado, contate o monitoramento!</p>
                </div>
              ) : (
                <Button className="w-full" onClick={handleEnviar} disabled={spinners.enviando || dayjs(props.data.data_emissao).isBefore(dayjs(), 'day')} loading={spinners.enviando}>
                  {
                    spinners.enviando ? 'Enviando...' : 'Enviar para análise'
                  }
                </Button>
              )
            )}

            {props.data.status === 'enviada' && (
              <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                <ClockIcon size={16} />
                Aguardando análise do administrador
              </div>
            )}

            {props.data.status === 'aprovada' && (
              <div className="text-sm font-medium text-green-600 flex items-center">
                <CheckIcon size={16} className="mr-1" />
                Troca aprovada, o envio será realizado na próxima entrega!
              </div>
            )}

            {props.data.status === 'reprovada' && (
              <div className="text-sm font-medium text-red-600 flex items-center">
                <XIcon size={16} className="mr-1" />
                Troca reprovada
              </div>
            )}
          </>
        )}

        {/* Botões de Ação (Aparecem apenas quando pendente e para perfis com permissão) */}
        {props.data.status === 'enviada' && user?.role !== 'motorista' && (
          <>
            <Button
              onClick={handleReprovar}
              color="destructive"
              disabled={spinners.reprovando || spinners.aprovando}
              loading={spinners.reprovando}
            >
              {!spinners.reprovando && <MessageCircleIcon size={16} />}
              {spinners.reprovando ? 'Processando...' : 'Reprovar'}
            </Button>

            <Button
              onClick={handleAprovar}
              color="success"
              disabled={spinners.aprovando || spinners.reprovando}
              loading={spinners.aprovando}
            >
              {!spinners.aprovando && <MessageCircleIcon size={16} />}
              {spinners.aprovando ? 'Processando...' : 'Aprovar e Notificar Cliente'}
            </Button>
          </>
        )}

        {/* Botão de Monitoramento (Exclusivo para Monitoramento) */}
        {user?.role === 'monitoramento' && (
          <VisualizarAvaria spinners={spinners} avaria={props.data} reload={() => props.reloadData?.()} />
        )}

      </CardFooter>
    </Card >
  );
};