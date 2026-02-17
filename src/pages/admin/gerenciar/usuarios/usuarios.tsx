import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { formatCPF } from "@/utils/formatters";
import { Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function UserManagement() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {

      setLoading(true);

      const response = await axios.get<ApiResponse<Usuario[]>>('/usuarios', {
        params: { role: 'monitoramento' }
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
        <h1 className="text-2xl font-bold">Usuários do Monitoramento</h1>
      </div>

      {loading && <div className="text-center py-8 text-muted-foreground">Carregando...</div>}

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
                    <p className="font-medium">{user.nome}</p>
                    <p className="text-xs text-muted-foreground">CPF: {formatCPF(user.cpf)}</p>
                  </div>
                </div>
                <Badge variant="default">{user.role}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
