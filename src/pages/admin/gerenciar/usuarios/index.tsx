import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/custom/loader";
import SearchPanel from "@/components/custom/search-panel";
import { useHeader } from "@/hooks/use-header";
import GerenciarUsuario from "./components/gerenciar-usuario";
import UserCard from "./components/user-card";

export default function AdminUsuarios() {

  // =============== STATES ===============
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== FILTERS  ===============
  const [filters, setFilters] = useState({
    busca: '',
    role: 'todos'
  });

  // =============== EFFECTS ===============

  useEffect(() => {

    // setar título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Usuários", href: "/admin/gerenciar/usuarios" }
    ]);
  }, []);

  useEffect(() => { fetchUsers() }, [filters.role]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse<Usuario[]>>('/usuarios', {
        params: {
          search: filters.busca,
          role: filters.role === 'todos' ? undefined : filters.role
        }
      });
      const { data } = response;

      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar usuários");
      }
    } catch (error) {
      toast.error("Erro ao carregar usuários");
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuários</h1>
        <GerenciarUsuario onSubmit={fetchUsers} />
      </div>

      <SearchPanel
        total={users.length}
        placeholder="Pesquise usuários pelo nome ou cpf"
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        defaultFilter={filters.role}
        filters={[
          { label: "Todos", value: "todos" },
          { label: "Monitoramento", value: "monitoramento" },
          { label: "Motoristas", value: "motorista" }
        ]}
        onFilterChange={(newFilters) => setFilters({ ...filters, role: newFilters[0].value })}
        fetchData={fetchUsers}
      />

      {
        loading ? (
          <Loader showMessage />
        ) : (
          <div className="space-y-4">
            {
              users.length > 0 ? (
                users.map((user) => <UserCard key={user.id} user={user} fetchUsers={fetchUsers} />)
              ) : (
                <div className="text-center py-8 text-muted-foreground">Nenhum usuário encontrado</div>
              )
            }
          </div>
        )
      }
    </div>
  );
}
