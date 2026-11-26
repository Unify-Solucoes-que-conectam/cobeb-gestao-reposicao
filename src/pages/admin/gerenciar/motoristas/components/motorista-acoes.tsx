import Alert from "@/components/custom/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Motorista } from "@/types/consults";
import { Trash2Icon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GerenciarMotorista from "./gerenciar-motorista";

interface MotoristaAcoesProps {
  driver: Motorista;
  onChange: () => void;
}

/** Ações da linha do motorista: editar e excluir. */
export default function MotoristaAcoes({ driver, onChange }: MotoristaAcoesProps) {
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleRemove = async () => {
    try {
      setLoading(true);
      const response = await axios.delete<ApiResponse>(`/motoristas/${driver.id}`);

      if (response.data.success) {
        toast.success(response.data.message || "Motorista removido com sucesso!");
        onChange();
      } else {
        toast.error(response.data.message || "Falha ao remover motorista. Tente novamente.");
      }
    } catch {
      toast.error("Ocorreu um erro ao remover o motorista. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <GerenciarMotorista driver={driver} onSubmit={onChange} />
      <Alert
        title="Você tem certeza que deseja excluir este motorista?"
        description="Esta ação não pode ser desfeita."
        confirmButton={{ onClick: handleRemove }}
      >
        <Tooltip content="Clique para remover" color="destructive" variant={theme === 'dark' ? 'outline' : 'solid'}>
          <Button variant={theme === 'dark' ? 'outline' : 'solid'} color="destructive" size="icon" loading={loading} disabled={loading} aria-label={`Remover ${driver.nome}`}>
            {!loading && <Trash2Icon />}
          </Button>
        </Tooltip>
      </Alert>
    </div>
  );
}
