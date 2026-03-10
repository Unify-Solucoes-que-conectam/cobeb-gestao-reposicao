import Loader from "@/components/custom/loader";
import SearchPanel from "@/components/custom/search-panel";
import { useHeader } from "@/hooks/mobile/use-header";
import { useAuth } from "@/hooks/use-auth";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Cliente } from "@/types/consults";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import ClienteCard from "./components/cliente-card";
import DetectClientCard from "./components/detect-client-card";

export default function ClientHome() {

  // ============ HOOKS ===========
  const { setPageDescription } = useHeader();
  const { user } = useAuth();

  // ============ STATES ===========
  const [switched, setSwitched] = useState(false);
  const [spinners, setSpinners] = useState({
    geral: false,
  });

  // ============ FILTERS ===========
  const [filters, setFilters] = useState({
    busca: '',
  });

  // ============ DATA ===========
  const [clientes, setClients] = useState<Cliente[]>([]);
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  const [clienteDetectado, setClienteDetectado] = useState<Cliente | null>(null);

  // ============ EFFECTS ===========
  useEffect(() => {
    setPageDescription(user?.nome ? user.nome : 'Bem-vindo à área de cliente!');
    fetchClients();
  }, [])

  // ============ FETCHERS ===========
  const fetchClients = async () => {
    try {

      setClienteSelecionado(null);
      setSpinners((prev) => ({ ...prev, geral: true }));

      const response = await axios.get<ApiResponse<Cliente[]>>('/clientes', {
        params: {
          search: filters.busca,
          detalhar: true, // solicitar detalhes dos clientes
        }
      });
      const { data } = response;
      if (data.success) {
        setClients(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar clientes");
      }
    } catch (error) {
      toast.error("Erro ao carregar clientes");
      console.error("Error loading clients:", error);
    } finally {
      setSpinners((prev) => ({ ...prev, geral: false }));
    }
  };

  return (
    <div className="space-y-6">
      <DetectClientCard clientes={clientes} selected={clienteSelecionado} onSelect={(cliente) => !clienteSelecionado && setClienteSelecionado(cliente)} currentDetected={clienteDetectado} detectedClient={(cliente) => {
        if (!switched) {
          setClienteSelecionado(cliente)
          setClienteDetectado(cliente);
        }
      }} />
      <SearchPanel
        total={clientes.length}
        placeholder="Pesquise clientes pelo nome ou código"
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        fetchData={fetchClients}
      />
      <div className="space-y-3">
        <p className="text-sm font-bold text-muted-foreground mb-2">Clientes da rota</p>
        {
          spinners.geral ? (
            <Loader />
          ) : (
            clienteSelecionado ? (
              <ClienteCard key={clienteSelecionado.id} cliente={clienteSelecionado} type="selected" onClick={() => {
                setClienteSelecionado(null)
                setSwitched(true);
              }} />
            ) : (
              clientes.map((cliente) => <ClienteCard key={cliente.id} cliente={cliente} onClick={() => setClienteSelecionado(cliente)} />)
            )
          )
        }
      </div>
    </div>
  )
}
