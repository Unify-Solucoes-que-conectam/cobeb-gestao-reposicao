import { DataGrid } from "@/components/custom/data-grid";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UsersIcon } from "lucide-react";
import { useState } from "react";

interface VisualizarClientesProps {
  clientes: {
    codigo: string;
    razao_social: string;
  }[]
}

export default function VisualizarClientes(props: VisualizarClientesProps) {

  // states de controle
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="min-w-20" size="sm">
          {props.clientes.length}
          <UsersIcon className="text-blue-500" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Clientes vinculados ao mapa
          </DialogTitle>
          <DialogDescription>
            Abaixo estão listados os clientes vinculados ao mapa.
          </DialogDescription>
        </DialogHeader>
        <DataGrid
          data={props.clientes}
          columns={[
            {
              id: "codigo",
              header: "Código",
              renderCell: (_value, row) => row.codigo,
            },
            {
              id: "razao_social",
              header: "Razão Social",
              renderCell: (_value, row) => row.razao_social,
            }
          ]}
          getRowId={(row) => row.codigo}
          height="100%"
          enableStripedRows={false}
          className="max-h-110 overflow-auto"
          emptyValuePlaceholder="-"
          emptyComponent={
            <div className="flex h-full w-full flex-col items-center justify-center gap-2">
              <span className="text-muted-foreground">Nenhum cliente encontrado</span>
            </div>
          }
        />
      </DialogContent>
    </Dialog>
  )
}