import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/custom/loader";
import SearchPanel from "@/components/custom/search-panel";
import { useHeader } from "@/hooks/use-header";
import { Motorista } from "@/types/consults";
import GerenciarUsuario from "./components/gerenciar-motorista";
import DriverCard from "./components/motorista-card";

export default function AdminMotoristas() {

  // =============== STATES ===============
  const [drivers, setDrivers] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== FILTERS  ===============
  const [filters, setFilters] = useState({
    busca: '',
    status: 'ativo'
  });

  // =============== EFFECTS ===============

  useEffect(() => {

    // setar título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Motoristas", href: "/admin/gerenciar/motoristas" }
    ]);
  }, []);

  useEffect(() => { fetchDrivers() }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse<Motorista[]>>('/motoristas', {
        params: {
          search: filters.busca,
        }
      });
      const { data } = response;

      if (data.success) {
        setDrivers(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar motoristas");
      }
    } catch (error) {
      toast.error("Erro ao carregar motoristas");
      console.error("Error loading motoristas:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Motoristas</h1>
        <GerenciarUsuario onSubmit={fetchDrivers} />
      </div>

      <SearchPanel
        total={drivers.length}
        placeholder="Pesquise motoristas pelo nome ou cpf"
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        defaultFilter={filters.status}
        filters={[
          { label: "Todos", value: "todos" },
          { label: "Ativos", value: "ativo" },
          { label: "Inativos", value: "inativo" }
        ]}
        onFilterChange={(newFilters) => setFilters({ ...filters, status: newFilters[0].value })}
        fetchData={fetchDrivers}
      />

      {
        loading ? (
          <Loader showMessage />
        ) : (
          <div className="space-y-4">
            {
              drivers.length > 0 ? (
                drivers.map((driver) => <DriverCard key={driver.id} driver={driver} fetchMotoristas={fetchDrivers} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum motorista encontrado</div>
              )
            }
          </div>
        )
      }
    </div>
  );
}
