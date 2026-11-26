import { useAuth } from '@/hooks/use-auth';
import dayjs from '@/lib/dayjs';
import { Mapa } from '@/types/consults';
import DesignarMotorista from './designar-motorista';
import GerenciarClientesMapa from './gerenciar-clientes-mapa';

interface MapaAcoesProps {
  mapa: Mapa;
  onChange: () => void;
}

/**
 * Ações da linha do mapa. Os botões sempre aparecem; quando a ação não pode ser
 * usada (entrega já passou ou o grupo não tem a ação liberada), ficam desabilitados
 * e o tooltip explica o motivo.
 */
export default function MapaAcoes({ mapa, onChange }: MapaAcoesProps) {
  const { can } = useAuth();
  const entregaPassou = dayjs(mapa.data_entrega).isBefore(dayjs(), 'day');
  const motivoEntrega = entregaPassou ? 'Indisponível: a data de entrega deste mapa já passou' : undefined;

  const bloqueioClientes = motivoEntrega
    ?? (can('mapas.alterar_clientes') ? undefined : 'Seu grupo não tem permissão para alterar clientes');
  const bloqueioMotorista = motivoEntrega
    ?? (can('mapas.designar_motorista') ? undefined : 'Seu grupo não tem permissão para designar motoristas');

  return (
    <div className="flex gap-2">
      <GerenciarClientesMapa mapa={mapa} reload={onChange} bloqueio={bloqueioClientes} />
      <DesignarMotorista mapa={mapa} reload={onChange} bloqueio={bloqueioMotorista} />
    </div>
  );
}
