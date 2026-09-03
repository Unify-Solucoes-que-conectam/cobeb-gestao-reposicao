import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/custom/loader";
import SearchPanel from "@/components/custom/search-panel";
import { useHeader } from "@/hooks/use-header";
import { Cluster, Filial, Motorista } from "@/types/consults";
import SelectFilterAddon from "./components/addons/select-filter";
import GerenciarUsuario from "./components/gerenciar-motorista";
import DriverCard from "./components/motorista-card";

export default function AdminMotoristas() {

  // =============== STATES ===============
  const [spinners, setSpinners] = useState({
    geral: false,
    filiais: false,
    clusters: false,
  });

  // =============== DATA ===============
  const [drivers, setDrivers] = useState<Motorista[]>([]);
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== FILTERS  ===============
  const [filters, setFilters] = useState({
    busca: '',
    status: 'ativo',
    filial: 'todos',
    cluster: 'todos'
  });

  // =============== EFFECTS ===============

  useEffect(() => {

    // setar título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Motoristas", href: "/admin/gerenciar/motoristas" }
    ]);

    // carregar dados iniciais
    fetchFiliais()
    fetchClusters()
    fetchDrivers()
  }, []);

  useEffect(() => {
    fetchDrivers()
  }, [filters]);

  const fetchDrivers = async () => {
    try {
      setSpinners((prev) => ({ ...prev, geral: true }));

      const response = await axios.get<ApiResponse<Motorista[]>>('/motoristas', {
        params: {
          search: filters.busca,
          status: filters.status !== 'todos' ? filters.status : undefined,
          filial: filters.filial !== 'todos' ? filters.filial : undefined,
          cluster: filters.cluster !== 'todos' ? filters.cluster : undefined,
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
      setSpinners((prev) => ({ ...prev, geral: false }));
    }
  };

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

  const fetchClusters = async () => {
    try {
      setSpinners((prev) => ({ ...prev, clusters: true }));

      const response = await axios.get<ApiResponse<Cluster[]>>('/clusters');
      const { data } = response;

      if (data.success) {
        setClusters(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar clusters");
      }
    } catch (error) {
      toast.error("Erro ao carregar clusters");
      console.error("Error loading clusters:", error);
    } finally {
      setSpinners((prev) => ({ ...prev, clusters: false }));
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
          { label: "Todos os status", value: "todos" },
          { label: "Ativos", value: "ativo" },
          { label: "Inativos", value: "inativo" },
          { label: "Bloqueados", value: "bloqueado" },
        ]}
        onFilterChange={(newFilters) => setFilters({ ...filters, status: newFilters[0].value })}
        fetchData={fetchDrivers}
        addons={
          <div className="flex gap-3">
            <SelectFilterAddon
              disabled={spinners.filiais}
              loading={spinners.filiais}
              defaultFilter="todos"
              filters={[
                { label: "Todas as filiais", value: "todos" },
                ...filiais.map(filial => ({ label: filial.descricao, value: filial.id }))
              ]}
              onFilterChange={(newFilters) => setFilters({ ...filters, filial: newFilters[0].value })}
            />
            <SelectFilterAddon
              disabled={spinners.clusters}
              loading={spinners.clusters}
              defaultFilter="todos"
              filters={[
                { label: "Todos os clusters", value: "todos" },
                ...clusters.map(cluster => ({ label: cluster.descricao, value: cluster.id }))
              ]}
              onFilterChange={(newFilters) => setFilters({ ...filters, cluster: newFilters[0].value })}
            />
          </div>
        }
      />

      {
        spinners.geral ? (
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
