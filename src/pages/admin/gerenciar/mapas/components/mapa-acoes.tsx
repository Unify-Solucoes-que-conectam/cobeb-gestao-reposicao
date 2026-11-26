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
 * Ações da linha do mapa. Mapas de hoje ou futuros podem ter o motorista
 * designado/trocado e os clientes alterados (conforme as ações do grupo).
 */
export default function MapaAcoes({ mapa, onChange }: MapaAcoesProps) {
  const { can } = useAuth();
  const podeDesignar = can('mapas.designar_motorista');
  const podeAlterarClientes = can('mapas.alterar_clientes');
  const editavel = !dayjs(mapa.data_entrega).isBefore(dayjs(), 'day');

  if (!editavel || (!podeDesignar && !podeAlterarClientes)) return null;

  return (
    <div className="flex gap-2">
      {podeAlterarClientes && <GerenciarClientesMapa mapa={mapa} reload={onChange} />}
      {podeDesignar && <DesignarMotorista mapa={mapa} reload={onChange} />}
    </div>
  );
}
