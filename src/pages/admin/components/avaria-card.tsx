import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from '@/lib/dayjs';
import { Avaria } from '@/types/consults';
import {
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  LayersIcon,
  MessageCircleIcon,
  TruckIcon
} from 'lucide-react';

interface AvariaCardProps {
  data: Avaria
}

/**
 * Componente AvariaCard
 * Exibe informações de ocorrências com suporte a múltiplos produtos.
 */
export default function AvariaCard({ data }: AvariaCardProps) {
  const {
    cliente,
    motorista,
    produto,
    tipo,
    status,
    nf,
    data: dataOcorrencia,
    mapa
  } = data;

  const statusColors = {
    aguardando_analise: 'bg-amber-100 text-amber-700 border-amber-200',
    em_analise: 'bg-blue-100 text-blue-700 border-blue-200',
    concluido: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusLabels = {
    aguardando_analise: 'Aguardando Análise',
    em_analise: 'Em Análise',
    concluido: 'Concluído'
  };

  const tipoColors = {
    avariado: 'bg-red-50 text-red-600 border-red-100',
    faltante: 'bg-gray-100 text-gray-600 border-gray-200',
    inversao: 'bg-purple-50 text-purple-600 border-purple-100'
  };

  const handleSendMessage = () => {
    const contato = cliente.contatos?.find(c =>
      c.tipo.toLowerCase().includes('celular') ||
      c.tipo.toLowerCase().includes('whatsapp')
    );
    if (contato) {
      const phone = contato.valor.replace(/\D/g, '');
      window.open(`https://wa.me/55${phone}`, '_blank');
    }
  };

  // Limite de produtos a serem exibidos antes do "ver mais"
  const MAX_VISIBLE_PRODUCTS = 3;
  const visibleProducts = produto.slice(0, MAX_VISIBLE_PRODUCTS);
  const remainingCount = produto.length - MAX_VISIBLE_PRODUCTS;

  return (
    <Card className="overflow-hidden">
      {/* Header do Card */}
      <CardHeader className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <CardTitle className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge className="text-[10px] font-bold bg-slate-800 hover:bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Cód. {cliente.codigo}
            </Badge>
            <h3 className="text-base font-bold dark:text-slate-400 truncate uppercase">
              {cliente.nome_fantasia || cliente.razao_social}
            </h3>
          </div>
          <div className="flex items-center text-slate-500 text-xs gap-3">
            <span className="flex items-center gap-1">
              <FileTextIcon size={14} className="text-slate-400" />
              NF: <span className="font-semibold text-slate-600">{nf}</span>
            </span>
            <span className="flex items-center gap-1">
              <CalendarIcon size={14} className="text-slate-400" />
              {dayjs(dataOcorrencia).format('DD/MM/YYYY HH:mm')}
            </span>
          </div>
        </CardTitle>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${statusColors[status]}`}>
            {statusLabels[status]}
          </span>
          <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border uppercase ${tipoColors[tipo]}`}>
            {tipo}
          </span>
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
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">Produtos ({produto.length})</p>
            <div className="space-y-1.5">
              {visibleProducts.map((p, index) => (
                <div key={index} className="flex justify-between items-center text-sm gap-2">
                  <span className="text-slate-500 truncate font-medium" title={p.descricao}>
                    {p.descricao}
                  </span>
                  <span className="text-[10px] font-bold bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
                    {p.quantidade} un
                  </span>
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
          <div className="p-2 rounded-lg shrink-0">
            <TruckIcon size={18} className="text-slate-600" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] text-slate-400 uppercase font-bold mb-1.5 tracking-tight">{motorista.cluster.descricao}</p>
            <p className="text-sm font-medium text-slate-500 truncate">
              <span className="text-slate-400 font-normal mr-1">[{motorista.codigo}]</span>
              {motorista.nome}
            </p>
            <p className="text-xs text-slate-500 truncate mt-1">
              Mapa: <span className="font-semibold">{mapa}</span> • {motorista.filial.descricao}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer / Ações */}
      <CardFooter className="px-4 py-3 flex items-center justify-end gap-2 border-t">
        <Button
          onClick={handleSendMessage}
          color='success'
        >
          <MessageCircleIcon size={16} />
          Notificar Cliente
        </Button>
        <Button
          color="warning"
        >
          <EyeIcon size={20} />
          Visualizar Detalhes
        </Button>
      </CardFooter>
    </Card>
  );
};