import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import dayjs from '@/lib/dayjs';
import { Mapa } from '@/types/consults';
import {
  CalendarIcon,
  LayersIcon,
  TruckIcon,
  UsersIcon,
  UserXIcon // Ícone adicional para indicar ausência de motorista
} from 'lucide-react';
import DesignarMotorista from './designar-motorista';

interface MapaCardProps {
  data: Mapa;
  reload: () => void;
}

/**
 * Componente MapaCard
 * Exibe informações de ocorrências com suporte a múltiplos produtos e fallback para motorista não vinculado.
 */
export default function MapaCard(props: MapaCardProps) {
  // Limite de clientes a serem exibidos antes do "ver mais"
  const MAX_VISIBLE_CLIENTES = 3;
  const visibleClients = props.data.clientes.slice(0, MAX_VISIBLE_CLIENTES);
  const remainingCount = props.data.clientes.length - MAX_VISIBLE_CLIENTES;

  // Extrai o motorista para facilitar o acesso
  const motorista = props.data.motorista;

  return (
    <Card className="overflow-hidden">
      {/* Header do Card */}
      <CardHeader className="border-neutral-100 dark:border-neutral-800 border-b flex flex-col p-0 space-y-0">
        <CardTitle className="p-4 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Badge className="text-[10px] font-bold p-1.5 rounded uppercase tracking-wider">
              MAPA {props.data.codigo}
            </Badge>
            <h3 className="text-base font-bold dark:text-slate-400 truncate uppercase">
              FILIAL {props.data.filial.descricao}
            </h3>
          </div>
        </CardTitle>
        <CardDescription className="flex gap-2 py-2 px-4 text-xs justify-between">
          <span className="flex items-center gap-1 text-slate-400">
            <CalendarIcon size={14} className="text-slate-300" />
            {dayjs(props.data.data_entrega).format('DD/MM/YYYY')}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <UsersIcon size={14} className="text-slate-300" />
            <span className="font-semibold">{props.data.clientes.length}</span> Cliente(s)
          </span>
        </CardDescription>
      </CardHeader>

      {/* Conteúdo Principal */}
      <CardContent className="px-4 py-3 grid grid-cols-1 md:grid-cols-2 gap-6 border-b">
        {/* Coluna 1: Lista de Clientes */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-lg shrink-0">
            <LayersIcon size={18} className="text-blue-600" />
          </div>
          <div className="min-w-0 w-full">
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
              Clientes ({props.data.clientes.length})
            </p>
            <div className="space-y-1.5">
              {visibleClients.map((c, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 truncate font-medium" title={c.nome_fantasia}>
                    {c.nome_fantasia}
                  </span>
                </div>
              ))}
              {remainingCount > 0 && (
                <p className="text-[11px] text-blue-600 font-bold mt-1 bg-blue-50/50 inline-block px-1 rounded">
                  + {remainingCount} outros clientes vinculados
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Coluna 2: Informações do Motorista (com Fallback) */}
        {motorista ? (
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg shrink-0">
              <TruckIcon size={18} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                {motorista.cluster?.descricao ?? 'Motorista'}
              </p>
              <p className="text-sm font-medium text-slate-500 truncate">
                <span className="text-slate-400 font-normal mr-1">[{motorista.codigo}]</span>
                {motorista.nome}
              </p>
            </div>
          </div>
        ) : (
          /* Estado Visual de Fallback */
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg shrink-0">
              <UserXIcon size={18} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-amber-600 dark:text-amber-500 uppercase font-bold tracking-tight">
                Motorista
              </p>
              <p className="text-sm font-medium text-slate-400 italic">
                Nenhum motorista designado
              </p>
            </div>
          </div>
        )}
      </CardContent>

      {/* Footer / Ações */}
      <CardFooter className="px-4 py-3 flex items-center justify-end gap-2">
        <DesignarMotorista mapa={props.data} reload={props.reload}/>
      </CardFooter>
    </Card>
  );
}