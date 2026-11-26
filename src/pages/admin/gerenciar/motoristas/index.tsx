import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { ColumnDef } from "@/components/custom/data-grid";
import { ListPage } from "@/components/custom/list-page";
import SearchPanel from "@/components/custom/search-panel";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useHeader } from "@/hooks/use-header";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils";
import { Cluster, Filial, Motorista } from "@/types/consults";
import { formatCPF } from "@/utils/formatters";
import SelectFilterAddon from "./components/addons/select-filter";
import GerenciarMotorista from "./components/gerenciar-motorista";
import MotoristaAcoes from "./components/motorista-acoes";

const todosOuValor = (value: string) => (value !== 'todos' ? value : undefined);

const STATUS: Record<Motorista['status'], { label: string; className: string }> = {
  ativo: { label: 'Ativo', className: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400' },
  inativo: { label: 'Inativo', className: 'border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400' },
  bloqueado: { label: 'Bloqueado', className: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400' },
};

export default function AdminMotoristas() {

  // =============== STATES ===============
  const [spinners, setSpinners] = useState({ filiais: false, clusters: false });
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();
  // o filtro (e a coluna) de filial só existem no tenant "Geral"; numa filial a API já restringe os dados
  const { tenant, can } = useAuth();
  const geral = !tenant || tenant.geral;
  const podeGerenciar = can('motoristas.gerenciar');

  // consulta paginada: o texto só é pesquisado ao clicar na lupa ou apertar Enter
  const consulta = usePaginatedQuery<Motorista, { status: string; filial: string; cluster: string }>(
    async ({ search, page, per_page, status, filial, cluster }, signal) => (
      await axios.get<ApiResponse<Motorista[]>>('/motoristas', {
        signal,
        params: { search, page, per_page, status: todosOuValor(status), filial: todosOuValor(filial), cluster: todosOuValor(cluster) },
      })
    ).data,
    { status: 'ativo', filial: 'todos', cluster: 'todos' },
    { errorMessage: 'Erro ao carregar motoristas' },
  );

  // =============== EFFECTS ===============
  useEffect(() => {
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Motoristas", href: "/admin/gerenciar/motoristas" }
    ]);

    if (geral) fetchFiliais()
    fetchClusters()
  }, []);

  const fetchFiliais = async () => {
    try {
      setSpinners((prev) => ({ ...prev, filiais: true }));
      const { data } = await axios.get<ApiResponse<Filial[]>>('/filiais');

      if (data.success) setFiliais(data.data);
      else toast.error(data.message || "Erro ao carregar filiais");
    } catch {
      toast.error("Erro ao carregar filiais");
    } finally {
      setSpinners((prev) => ({ ...prev, filiais: false }));
    }
  };

  const fetchClusters = async () => {
    try {
      setSpinners((prev) => ({ ...prev, clusters: true }));
      const { data } = await axios.get<ApiResponse<Cluster[]>>('/clusters');

      if (data.success) setClusters(data.data);
      else toast.error(data.message || "Erro ao carregar clusters");
    } catch {
      toast.error("Erro ao carregar clusters");
    } finally {
      setSpinners((prev) => ({ ...prev, clusters: false }));
    }
  };

  // =============== COLUMNS ===============
  const columns = useMemo<ColumnDef<Motorista>[]>(() => [
    ...(podeGerenciar ? [{ id: 'acoes', header: 'Ações', width: 120, renderCell: (_: unknown, m: Motorista) => <MotoristaAcoes driver={m} onChange={consulta.recarregar} /> }] : []),
    { id: 'codigo', header: 'Código', width: 100 },
    { id: 'nome', header: 'Nome', width: 'minmax(220px, 1.5fr)' },
    { id: 'cpf', header: 'CPF', width: 140, renderCell: (value) => formatCPF(value as string) },
    ...(geral ? [{ id: 'filial', header: 'Filial', width: 'minmax(140px, 1fr)', renderCell: (_: unknown, m: Motorista) => m.filial?.descricao }] : []),
    { id: 'cluster', header: 'Cluster', width: 'minmax(140px, 1fr)', renderCell: (_, m) => m.cluster?.descricao },
    {
      id: 'status', header: 'Status', width: 110,
      renderCell: (value) => {
        const status = STATUS[value as Motorista['status']];
        return status ? <Badge variant="outline" className={cn(status.className)}>{status.label}</Badge> : null;
      },
    },
    { id: 'data_admissao', header: 'Admissão', width: 110, renderCell: (value) => value ? dayjs(value as string).format('DD/MM/YYYY') : null },
  ], [geral, podeGerenciar, consulta.recarregar]);

  return (
    <ListPage
      title="Motoristas"
      actions={podeGerenciar && <GerenciarMotorista onSubmit={consulta.recarregar} />}
      search={
        <SearchPanel
          placeholder="Pesquise motoristas pelo código, nome ou CPF"
          search={consulta.busca}
          onSearchChange={consulta.setBusca}
          defaultFilter={consulta.filters.status}
          filters={[
            { label: "Todos os status", value: "todos" },
            { label: "Ativos", value: "ativo" },
            { label: "Inativos", value: "inativo" },
            { label: "Bloqueados", value: "bloqueado" },
          ]}
          onFilterChange={(newFilters) => consulta.setFilter('status', newFilters[0].value)}
          fetchData={consulta.pesquisar}
          addons={
            <div className="flex gap-3">
              {geral && <SelectFilterAddon
                disabled={spinners.filiais}
                loading={spinners.filiais}
                defaultFilter="todos"
                filters={[
                  { label: "Todas as filiais", value: "todos" },
                  ...filiais.map(filial => ({ label: filial.descricao, value: filial.id }))
                ]}
                onFilterChange={(newFilters) => consulta.setFilter('filial', newFilters[0].value)}
              />}
              <SelectFilterAddon
                disabled={spinners.clusters}
                loading={spinners.clusters}
                defaultFilter="todos"
                filters={[
                  { label: "Todos os clusters", value: "todos" },
                  ...clusters.map(cluster => ({ label: cluster.descricao, value: cluster.id }))
                ]}
                onFilterChange={(newFilters) => consulta.setFilter('cluster', newFilters[0].value)}
              />
            </div>
          }
        />
      }
      columns={columns}
      data={consulta.items}
      getRowId={(m) => m.id}
      loading={consulta.loading}
      emptyMessage="Nenhum motorista encontrado."
      pagination={{
        page: consulta.page,
        pageSize: consulta.perPage,
        total: consulta.total,
        onPageChange: consulta.setPage,
        onPageSizeChange: consulta.setPerPage,
        label: `${consulta.total} motorista(s) encontrado(s).`,
      }}
    />
  );
}
