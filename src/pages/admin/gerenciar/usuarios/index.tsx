import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import Loader from "@/components/custom/loader";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useHeader } from "@/hooks/use-header";
import GerenciarUsuario from "./components/gerenciar-usuario";
import UserCard from "./components/user-card";

export default function UserManagement() {

  // =============== STATES ===============
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== FILTERS  ===============
  const [filters, setFilters] = useState({
    nome: '',
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

  useEffect(() => { fetchUsers() }, [filters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await axios.get<ApiResponse<Usuario[]>>('/usuarios', {
        params: {
          nome: filters.nome,
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
        <GerenciarUsuario />
      </div>

      <div className="flex justify-between items-center gap-3">
        <InputGroup className="h-10">
          <InputGroupInput onKeyDown={(key) => ['Enter', 'NumpadEnter'].includes(key.code) && fetchUsers()} placeholder="Search..." value={filters.nome} onChange={(e) => setFilters((prev) => ({ ...prev, nome: e.target.value }))} />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">{users.length} {users.length === 1 ? "resultado" : "resultados"}</InputGroupAddon>
        </InputGroup>

        <Button size="icon" onClick={() => fetchUsers()}>
          <SearchIcon />
        </Button>

        <Select defaultValue="todos" onValueChange={(value) => setFilters((prev) => ({ ...prev, role: value }))}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="monitoramento">Monitoramento</SelectItem>
              <SelectItem value="motorista">Motoristas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

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
