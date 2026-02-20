import Alert from "@/components/custom/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { capitalizeName, formatCPF } from "@/utils/formatters";
import { ShieldIcon, Trash2Icon, TruckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GerenciarUsuario from "./gerenciar-usuario";
import PasswordChangerDialog from "@/components/custom/password-changer";

interface UserCardProps {
  user: Usuario;
  fetchUsers: () => void;
}
export default function UserCard({ user, fetchUsers }: UserCardProps) {

  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);
      const response = await axios.delete<ApiResponse>(`/usuarios/${user.id}`);

      if (response.data.success) {
        toast.success(response.data.message || "Usuário removido com sucesso!");
        fetchUsers();
      } else {
        toast.error(response.data.message || "Falha ao remover usuário. Tente novamente.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao remover o usuário. Tente novamente.");
      console.error("Erro ao remover usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", {
              "bg-primary/10": user.role === 'monitoramento',
              "bg-yellow-500/10": user.role === 'motorista'
            })}>
              {
                user.role === 'monitoramento' ? (
                  <ShieldIcon className="h-5 w-5 text-primary" />
                ) : (
                  <TruckIcon className="h-5 w-5 text-yellow-500" />
                )
              }
            </div>
            <div>
              <p className="font-medium">{capitalizeName(user.nome)}</p>
              <p className="text-xs text-muted-foreground">CPF: {formatCPF(user.cpf)}</p>
            </div>
          </div>

          <div className="flex gap-3">
            <PasswordChangerDialog user_id={user.id} onSuccess={fetchUsers} />
            <Alert
              title="Você tem certeza que deseja excluir este usuário?"
              description="Esta ação não pode ser desfeita."
              confirmButton={{
                onClick: handleRemove
              }}
            >
              <Tooltip content="Clique para remover" color="destructive">
                <Button color="destructive" size="icon" loading={loading} disabled={loading}>
                  {!loading && <Trash2Icon />}
                </Button>
              </Tooltip>
            </Alert>
            <GerenciarUsuario user={user} onSubmit={fetchUsers} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}