import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from '@/lib/dayjs';
import { Mapa } from '@/types/consults';
import {
  CalendarIcon,
  EyeIcon,
  FileTextIcon,
  LayersIcon,
  TruckIcon,
  UsersIcon
} from 'lucide-react';

interface MapaCardProps {
  data: Mapa
}

/**
 * Componente MapaCard
 * Exibe informações de ocorrências com suporte a múltiplos produtos.
 */
export default function MapaCard({ data }: MapaCardProps) {
  const {
    clientes,
    motorista,
    mapa,
    qntd_clientes,
    qntd_notas
  } = data;

  // Limite de clientes a serem exibidos antes do "ver mais"
  const MAX_VISIBLE_CLIENTES = 3;
  const visibleClients = clientes.slice(0, MAX_VISIBLE_CLIENTES);
  const remainingCount = clientes.length - MAX_VISIBLE_CLIENTES;

  return (
    <Card className="overflow-hidden">
      {/* Header do Card */}
      <CardHeader className="border-neutral-100 dark:border-neutral-800 border-b flex flex-col p-0 space-y-0">
        <CardTitle className='p-4 border-b border-neutral-100 dark:border-neutral-800'>
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] font-bold p-1.5 rounded uppercase tracking-wider">
              MAPA {mapa}
            </Badge>
            <h3 className="text-base font-bold dark:text-slate-400 truncate uppercase">
              FILIAL {data.motorista.filial}
            </h3>
          </div>
        </CardTitle>
        <CardDescription className='flex gap-2 py-2 px-4 text-xs'>
          <span className="flex items-center gap-1 text-slate-400">
            <CalendarIcon size={14} className='text-slate-300'/>
            {dayjs(new Date()).format('DD/MM/YYYY HH:mm')}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <UsersIcon size={14} className='text-slate-300'/>
            <span className="font-semibold">{qntd_clientes}</span> Cliente(s)
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <FileTextIcon size={14} className='text-slate-300'/>
            <span className="font-semibold">{qntd_notas}</span> {qntd_notas > 1 ? 'Notas Fiscais' : 'Nota Fiscal'}
          </span>
        </CardDescription>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Coluna 1: Lista de Produtos */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <LayersIcon size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Clientes ({qntd_clientes})</p>
            <div className="space-y-1.5">
              {visibleClients.map((c, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 truncate font-medium" title={c.nome}>
                    {c.nome}
                  </span>
                  <Badge className="text-[10px] font-bold rounded">
                    {c.notas_fiscais.length} NF{c.notas_fiscais.length > 1 ? 's' : ''}
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
          <div className="p-2 bg-neutral-100 rounded-lg shrink-0 ">
            <TruckIcon size={18} className="text-slate-600" />
          </div>
          <div className="">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{motorista.cluster}</p>
            <p className="text-sm font-medium text-slate-500 truncate">
              <span className="text-slate-400 font-normal mr-1">[{motorista.codigo}]</span>
              {motorista.nome}
            </p>
          </div>
        </div>
      </CardContent>

      {/* Footer / Ações */}
      <CardFooter className="px-4 py-3 flex items-center justify-end gap-2">
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