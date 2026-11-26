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
import { Filial, Mapa } from "@/types/consults";
import MapaAcoes from "./components/mapa-acoes";

export default function AdminMapas() {

  // =============== STATES ===============
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [filiais, setFiliais] = useState<Filial[]>([]);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();
  // o filtro (e a coluna) de filial só existem no tenant "Geral"; numa filial a API já restringe os dados
  const { tenant } = useAuth();
  const geral = !tenant || tenant.geral;

  // consulta paginada: o texto só é pesquisado ao clicar na lupa ou apertar Enter
  const consulta = usePaginatedQuery<Mapa, { filial: string }>(
    async ({ search, page, per_page, filial }, signal) => (
      await axios.get<ApiResponse<Mapa[]>>('/mapas', {
        signal,
        params: { search, page, per_page, filial: filial !== 'todas' ? filial : undefined },
      })
    ).data,
    { filial: 'todas' },
    { errorMessage: 'Erro ao consultar mapas' },
  );

  // =============== EFFECTS ===============
  useEffect(() => {
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Mapas", href: "/admin/gerenciar/mapas" }
    ]);

    if (geral) fetchFiliais()
  }, []);

  const fetchFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const { data } = await axios.get<ApiResponse<Filial[]>>('/filiais');

      if (data.success) setFiliais(data.data);
      else toast.error(data.message || "Erro ao carregar filiais");
    } catch {
      toast.error("Erro ao carregar filiais");
    } finally {
      setLoadingFiliais(false);
    }
  };

  // =============== COLUMNS ===============
  const columns = useMemo<ColumnDef<Mapa>[]>(() => [
    { id: 'acoes', header: 'Ações', width: 120, renderCell: (_, mapa) => <MapaAcoes mapa={mapa} onChange={consulta.recarregar} /> },
    { id: 'codigo', header: 'Mapa', width: 110 },
    ...(geral ? [{ id: 'filial', header: 'Filial', width: 160, renderCell: (_: unknown, mapa: Mapa) => mapa.filial?.descricao }] : []),
    { id: 'data_entrega', header: 'Entrega', width: 110, renderCell: (value) => dayjs(value as string).format('DD/MM/YYYY') },
    { id: 'placa', header: 'Placa', width: 100 },
    {
      id: 'motorista', header: 'Motorista', width: 'minmax(200px, 1fr)',
      renderCell: (_, mapa) => mapa.motorista
        ? <span><span className="mr-1 text-muted-foreground">[{mapa.motorista.codigo}]</span>{mapa.motorista.nome}</span>
        : <Badge variant="outline" className="border-amber-300 text-amber-700 dark:text-amber-400">Não designado</Badge>,
    },
    {
      // rotas valem só no dia da designação: às 00h são encerradas (o motorista fica como histórico)
      id: 'status', header: 'Rota', width: 130,
      renderCell: (_, mapa) => mapa.status === 'em_andamento'
        ? <Badge variant="outline" className="border-emerald-300 text-emerald-700 dark:text-emerald-400">Em andamento</Badge>
        : mapa.status === 'encerrado'
          ? <Badge variant="outline" className="text-muted-foreground" title={mapa.encerrado_em ? `Encerrada em ${dayjs(mapa.encerrado_em).format('DD/MM/YYYY HH:mm')}` : undefined}>Encerrada</Badge>
          : null,
    },
  ], [geral, consulta.recarregar]);

  return (
    <ListPage
      title="Mapas"
      search={
        <SearchPanel
          placeholder="Pesquise mapas pelo código"
          search={consulta.busca}
          onSearchChange={consulta.setBusca}
          defaultFilter={"todas"}
          filters={geral && !loadingFiliais ? [
            { label: "Todas as filiais", value: "todas" },
            ...filiais.map(filial => ({ label: filial.descricao, value: filial.id }))
          ] : undefined}
          onFilterChange={geral ? (newFilters) => consulta.setFilter('filial', newFilters[0].value) : undefined}
          fetchData={consulta.pesquisar}
        />
      }
      columns={columns}
      data={consulta.items}
      getRowId={(mapa) => mapa.id}
      loading={consulta.loading}
      emptyMessage="Nenhum mapa encontrado."
      pagination={{
        page: consulta.page,
        pageSize: consulta.perPage,
        total: consulta.total,
        onPageChange: consulta.setPage,
        onPageSizeChange: consulta.setPerPage,
        label: `${consulta.total} mapa(s) encontrado(s).`,
      }}
    />
  );
}
