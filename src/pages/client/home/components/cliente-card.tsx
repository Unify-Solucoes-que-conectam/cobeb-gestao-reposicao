import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Cliente } from "@/types/consults";
import { FileTextIcon, MapPinIcon, PackageIcon, UserIcon } from "lucide-react";
import { useNavigate } from "react-router";

interface ClienteCardProps {
  cliente: Cliente
  type?: 'selected' | 'list'
  onClick?: () => void;
}
export default function ClienteCard({
  cliente,
  type = 'list',
  onClick,
}: ClienteCardProps) {

  const navigate = useNavigate();

  if (type === 'selected') {
    return (
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader className="p-4 flex-row justify-between items-center">
          <CardTitle className="text-md">Cliente Selecionado</CardTitle>
          <CardDescription>
            <Button variant='ghost' onClick={onClick}>
              Trocar
            </Button>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <UserIcon className="text-muted-foreground size-4" />
            <span className="uppercase">
              [{cliente.codigo}] {cliente.nome_fantasia}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPinIcon className="text-muted-foreground size-4" />
            <span className="uppercase">{cliente.endereco}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FileTextIcon className="text-muted-foreground size-4" />
            <span>{cliente.qntd_notas_fiscais} NF(s)</span>
          </div>
          <div className="flex items-center space-x-2">
            <PackageIcon className="text-muted-foreground size-4" />
            <span>{cliente.qntd_produtos} Produto(s)</span>
          </div>
        </CardContent>
        <CardFooter className="px-4">
          <Button className="w-full h-12" onClick={() => navigate('/client/registrar-avarias')}>
            Registar Avarias
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="flex justify-between items-center border-2 hover:border-primary cursor-pointer" onClick={onClick}>
      <CardHeader className="p-4">
        <CardTitle className="text-md">{cliente.nome_fantasia}</CardTitle>
        <CardDescription>Cód. {cliente.codigo}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 py-4 pr-4">
        <Badge className="text-[10px] font-bold bg-slate-200 hover:bg-slate-300 text-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">
          {cliente.qntd_notas_fiscais && cliente.qntd_notas_fiscais > 0 ? `${cliente.qntd_notas_fiscais} NF(s)` : 'NF'}
        </Badge>
      </CardContent>
    </Card>
  )
}