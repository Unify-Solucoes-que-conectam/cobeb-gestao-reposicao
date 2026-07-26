import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/custom/loader";
import SearchPanel from "@/components/custom/search-panel";
import { useHeader } from "@/hooks/use-header";
import { Filial, Mapa } from "@/types/consults";
import MapaCard from "./components/mapa-card";
import { mapaService } from "@/services/api.service";

export default function AdminUsuarios() {

  // =============== STATES ===============
  const [maps, setMaps] = useState<Mapa[]>([]);
  const [spinners, setSpinners] = useState({ geral: true, filiais: false });

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== FILTERS  ===============
  const [filters, setFilters] = useState({
    busca: '',
    filial: 'todas',
  });

  // =============== DATA ===============
  const [filiais, setFiliais] = useState<Filial[]>([]);

  // =============== EFFECTS ===============
  useEffect(() => {

    // setar título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Mapas", href: "/admin/gerenciar/mapas" }
    ]);
  }, []);

  useEffect(() => {
    fetchMapas()
    fetchFiliais()
  }, []);

  // =============== HANDLERS ===============
  /**
   * Consultar avarias do cliente selecionado, filtrando por status (opcional)
   */
  const fetchMapas = async ({ signal }: { signal?: AbortSignal } = {}) => {
    setSpinners((prev) => ({ ...prev, geral: true }));
    const response = await mapaService.read({}, signal);

    if (response.success) {
      setMaps(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }

    setSpinners((prev) => ({ ...prev, geral: false }));
  }

  const fetchFiliais = async () => {
    try {
      setSpinners((prev) => ({ ...prev, filiais: true }));

      const response = await axios.get<ApiResponse<Filial[]>>('/filiais');
      const { data } = response;

      if (data.success) {
        setFiliais(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar filiais");
      }
    } catch (error) {
      toast.error("Erro ao carregar filiais");
      console.error("Error loading filiais:", error);
    } finally {
      setSpinners((prev) => ({ ...prev, filiais: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mapas</h1>
      </div>

      <SearchPanel
        total={maps.length}
        placeholder="Pesquise mapas pelo nome ou código"
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        defaultFilter={"todas"}
        filters={[
          { label: "Todas as filiais", value: "todas" },
          ...filiais.map(filial => ({ label: filial.descricao, value: filial.id }))
        ]}
        onFilterChange={(newFilters) => setFilters({ ...filters, filial: newFilters[0].value })}
        fetchData={fetchMapas}
      />

      {
        spinners.geral ? (
          <Loader showMessage />
        ) : (
          <div className="space-y-4">
            {
              maps.length > 0 ? (
                maps.map((mapa) => <MapaCard key={mapa.codigo} data={mapa} reload={fetchMapas} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum mapa encontrado</div>
              )
            }
          </div>
        )
      }
    </div>
  );
}
