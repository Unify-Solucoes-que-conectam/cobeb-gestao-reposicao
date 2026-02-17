import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { capitalizeName, formatCPF } from "@/utils/formatters";
import { SearchIcon, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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

export default function UserManagement() {

  // =============== STATES ===============
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  // =============== HOOKS  ===============
  const { setPageBreadcrumbs } = useHeader();

  // =============== EFFECTS ===============

  useEffect(() => {

    // setar título da página
    setPageBreadcrumbs([
      { title: "Gerenciar", href: "#" },
      { title: "Usuários", href: "/admin/gerenciar/usuarios" }
    ]);

    fetchUsers();
  }, []);

  const fetchUsers = async (role: string = 'monitoramento') => {
    try {

      setLoading(true);

      const response = await axios.get<ApiResponse<Usuario[]>>('/usuarios', {
        params: { role: role === 'todos' ? undefined : role }
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
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">{users.length} {users.length === 1 ? "resultado" : "resultados"}</InputGroupAddon>
        </InputGroup>

        <Select defaultValue="todos" onValueChange={(value) => fetchUsers(value)}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="monitoramento">Monitoramento</SelectItem>
              <SelectItem value="motoristas">Motoristas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {
        loading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/10">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{capitalizeName(user.nome)}</p>
                        <p className="text-xs text-muted-foreground">CPF: {formatCPF(user.cpf)}</p>
                      </div>
                    </div>
                    <Badge variant="default">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }
    </div>
  );
}
