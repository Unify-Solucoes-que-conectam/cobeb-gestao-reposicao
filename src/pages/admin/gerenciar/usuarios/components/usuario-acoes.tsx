import Alert from "@/components/custom/alert-dialog";
import PasswordChangerDialog from "@/components/custom/password-changer";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GerenciarUsuario from "./gerenciar-usuario";

interface UsuarioAcoesProps {
  user: Usuario;
  onChange: () => void;
}

/** Ações da linha do usuário: editar, alterar senha e excluir. */
export default function UsuarioAcoes({ user, onChange }: UsuarioAcoesProps) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleRemove = async () => {
    try {
      setLoading(true);
      const response = await axios.delete<ApiResponse>(`/usuarios/${user.id}`);

      if (response.data.success) {
        toast.success(response.data.message || "Usuário removido com sucesso!");
        onChange();
      } else {
        toast.error(response.data.message || "Falha ao remover usuário. Tente novamente.");
      }
    } catch {
      toast.error("Ocorreu um erro ao remover o usuário. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <GerenciarUsuario user={user} onSubmit={onChange} />
      <PasswordChangerDialog user_id={user.id} onSuccess={onChange} />
      <Alert
        title="Você tem certeza que deseja excluir este usuário?"
        description="Esta ação não pode ser desfeita."
        confirmButton={{ onClick: handleRemove }}
      >
        <Tooltip content="Clique para remover" color="destructive" variant={theme === 'dark' ? 'outline' : 'solid'}>
          <Button variant={theme === 'dark' ? 'outline' : 'solid'} color="destructive" size="icon" loading={loading} disabled={loading} aria-label={`Remover ${user.nome}`}>
            {!loading && <Trash2Icon />}
          </Button>
        </Tooltip>
      </Alert>
    </div>
  );
}
