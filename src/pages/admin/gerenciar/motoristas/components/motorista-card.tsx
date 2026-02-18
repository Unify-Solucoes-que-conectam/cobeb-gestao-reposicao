import Alert from "@/components/custom/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip } from "@/components/ui/tooltip";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Motorista } from "@/types/consults";
import { Trash2Icon, TruckIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import GerenciarMotorista from "./gerenciar-motorista";

interface DriverCardProps {
  driver: Motorista;
  fetchMotoristas: () => void;
}
export default function DriverCard({ driver, fetchMotoristas }: DriverCardProps) {

  const [loading, setLoading] = useState(false);

  const handleRemove = async () => {
    try {
      setLoading(true);
      const response = await axios.delete<ApiResponse>(`/motoristas/${driver.id}`);

      if (response.data.success) {
        toast.success(response.data.message || "Motorista removido com sucesso!");
        fetchMotoristas();
      } else {
        toast.error(response.data.message || "Falha ao remover motorista. Tente novamente.");
      }
    } catch (error) {
      toast.error("Ocorreu um erro ao remover o motorista. Tente novamente.");
      console.error("Erro ao remover motorista:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-500/10">
              <TruckIcon className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="flex flex-col">
              <p className="text-[10px] text-slate-600 uppercase font-bold tracking-tight">
                {driver.cluster.descricao}
              </p>
              <p className="text-sm font-medium truncate">
                <span className="text-slate-400 font-normal mr-1">[{driver.codigo}]</span>
                {driver.nome}
              </p>
              <p className="text-xs text-slate-500 truncate">
                Mapa: <span className="font-semibold">{546184}</span> • {driver.filial.descricao}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Alert
              title="Você tem certeza que deseja excluir este motorista?"
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
            <GerenciarMotorista driver={driver} onSubmit={fetchMotoristas} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}