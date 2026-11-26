import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { useEffect, useMemo } from "react";

import type { ColumnDef } from "@/components/custom/data-grid";
import { ListPage } from "@/components/custom/list-page";
import SearchPanel from "@/components/custom/search-panel";
import { Badge } from "@/components/ui/badge";
import { useHeader } from "@/hooks/use-header";
import { usePaginatedQuery } from "@/hooks/use-paginated-query";
import { capitalizeName, formatCPF } from "@/utils/formatters";
import GerenciarUsuario from "./components/gerenciar-usuario";
import UsuarioAcoes from "./components/usuario-acoes";

const PERFIS: Record<Usuario['role'], string> = {
  administrador: 'Administrador',
  monitoramento: 'Monitoramento',
  motorista: 'Motorista',
};

export default function AdminUsuarios() {

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // consulta paginada: o texto só é pesquisado ao clicar na lupa ou apertar Enter
  const consulta = usePaginatedQuery<Usuario, { role: string }>(
    async ({ search, page, per_page, role }, signal) => (
      await axios.get<ApiResponse<Usuario[]>>('/usuarios', {
        signal,
        params: { search, page, per_page, role: role !== 'todos' ? role : undefined },
      })
    ).data,
    { role: 'todos' },
    { errorMessage: 'Erro ao carregar usuários' },
  );

  // =============== EFFECTS ===============
  useEffect(() => {
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Usuários", href: "/admin/gerenciar/usuarios" }
    ]);
  }, []);

  // =============== COLUMNS ===============
  const columns = useMemo<ColumnDef<Usuario>[]>(() => [
    { id: 'acoes', header: 'Ações', width: 160, renderCell: (_, user) => <UsuarioAcoes user={user} onChange={consulta.recarregar} /> },
    { id: 'nome', header: 'Nome', width: 'minmax(240px, 2fr)', renderCell: (value) => capitalizeName(value as string) },
    { id: 'cpf', header: 'CPF', width: 140, renderCell: (value) => formatCPF(value as string) },
    { id: 'role', header: 'Perfil', width: 150, renderCell: (value) => <Badge variant="secondary">{PERFIS[value as Usuario['role']] ?? String(value)}</Badge> },
    { id: 'grupo', header: 'Grupo', width: 'minmax(160px, 1fr)', renderCell: (_, user) => user.grupo?.nome },
  ], [consulta.recarregar]);

  return (
    <ListPage
      title="Usuários"
      actions={<GerenciarUsuario onSubmit={consulta.recarregar} />}
      search={
        <SearchPanel
          placeholder="Pesquise usuários pelo nome ou CPF"
          search={consulta.busca}
          onSearchChange={consulta.setBusca}
          defaultFilter={consulta.filters.role}
          filters={[
            { label: "Todos", value: "todos" },
            { label: "Administradores", value: "administrador" },
            { label: "Monitoramento", value: "monitoramento" },
            { label: "Motoristas", value: "motorista" }
          ]}
          onFilterChange={(newFilters) => consulta.setFilter('role', newFilters[0].value)}
          fetchData={consulta.pesquisar}
        />
      }
      columns={columns}
      data={consulta.items}
      getRowId={(user) => user.id}
      loading={consulta.loading}
      emptyMessage="Nenhum usuário encontrado."
      pagination={{
        page: consulta.page,
        pageSize: consulta.perPage,
        total: consulta.total,
        onPageChange: consulta.setPage,
        onPageSizeChange: consulta.setPerPage,
        label: `${consulta.total} usuário(s) encontrado(s).`,
      }}
    />
  );
}
