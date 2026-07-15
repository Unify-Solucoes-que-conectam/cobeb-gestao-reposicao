import { Button } from "@/components/ui/button";
import {
    Select, SelectContent,
    SelectGroup,
    SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useHeader } from "@/hooks/mobile/use-header";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Cliente } from "@/types/consults";
import { FunnelIcon, PackageIcon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router";
import { toast } from "sonner";

export default function ClientRegistrarAvarias() {

    // ============= HOOKS =============
    const navigate = useNavigate()
    const { setPageTitle, setPageDescription, setShowBackButton } = useHeader();
    const [searchParams] = useSearchParams();
    const clienteId = searchParams.get('clienteId');
    const location = useLocation();

    // ============= STATES =============
    const [cliente, setCliente] = useState<Cliente | undefined>(location.state?.clienteInfo);

    // ============= EFFECTS =============
    useEffect(() => {
        setShowBackButton(true);

        if (cliente) {
            setPageTitle(cliente.nome_fantasia || 'Registrar Avarias');
            setPageDescription(`Cód: ${cliente.codigo} • ${cliente.endereco}`);
        } else {
            // Fallback de segurança: se o usuário recarregar a página (F5), ou acessar a URL direto
            setPageTitle('Registrar Avarias');
            setPageDescription('Carregando informações...');
            
            if (clienteId) getClientDetails();
        }
    }, [setPageTitle, setPageDescription, cliente]);

    // ============= HANDLERS =============
    const getClientDetails = async () => {
        try {

            const res = await axios.get<ApiResponse<Cliente>>(`/clientes/${clienteId}`, {
                params: {
                    detalhar: true
                }
            })

            const { data } = res.data;

            if (res.data.success) {
                setCliente(data);
            }
        } catch (err) {
            toast.error("Erro ao buscar detalhes do cliente. Contate o administrador do sistema caso o erro persista!");
            console.error("Erro ao buscar detalhes do cliente", err);
        }
    }

    return (
        <div className="space-y-20">
            <div className="flex justify-between items-center">
                <h1 className="font-bold text-lg">Avarias Registradas (0)</h1>
                <Select defaultValue="000">
                    <SelectTrigger className="w-45">
                        <FunnelIcon size={18} className="text-muted-foreground" />
                        <SelectValue placeholder="Tipos de Avaria" />
                    </SelectTrigger>
                    <SelectContent>

                        <SelectGroup>
                            <SelectItem value="000">Todos</SelectItem>
                            <SelectItem value="avariado">Avariado</SelectItem>
                            <SelectItem value="faltante">Faltante</SelectItem>
                            <SelectItem value="inversao">Inversão</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-10">
                <div className="flex flex-col gap-3 items-center justify-center">
                    <PackageIcon className="text-gray-400" size={42} />
                    <div className="text-center">
                        <p>Nenhuma avaria registrada</p>
                        <p className="text-sm">Clique em &quot;Adicionar Avaria&quot; para começar</p>
                    </div>
                </div>

                <Button className="w-full" onClick={() => navigate(`/client/registrar-avarias/etapa-001?codigo=${cliente?.codigo}&nome_fantasia=${cliente?.nome_fantasia}&endereco=${cliente?.endereco}`)}>
                    <PlusIcon />
                    <span>Adicionar Avaria</span>
                </Button>
            </div>
        </div>
    );
}