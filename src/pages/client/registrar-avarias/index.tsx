import { useHeader } from "@/hooks/mobile/use-header";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Cliente } from "@/types/consults";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";

export default function ClientRegistrarAvarias() {

    // ============= HOOKS =============
    const { setPageTitle, setPageDescription, setShowBackButton } = useHeader();
    const [searchParams] = useSearchParams();
    const clienteId = searchParams.get('clienteId');

    // ============= STATES =============
    const [cliente, setCliente] = useState<Cliente>();

    // ============= EFFECTS =============
    useEffect(() => {
        setPageTitle(cliente?.nome_fantasia || 'Registrar Avarias');
        setPageDescription('Cód: ' + cliente?.codigo + ' • ' + cliente?.endereco);
        setShowBackButton(true);

        // consultar dados do cliente para mostrar na tela
        getClientDetails();
    }, [setPageTitle, setPageDescription, setShowBackButton, cliente]);

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
        <div>
            <h1>Registrar Avarias para o cliente: {cliente?.nome_fantasia}</h1>
        </div>
    );
}