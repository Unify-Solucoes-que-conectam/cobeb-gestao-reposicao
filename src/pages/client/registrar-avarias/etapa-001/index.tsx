import SearchPanel from "@/components/custom/search-panel";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { useHeader } from "@/hooks/mobile/use-header";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Cliente, NotaFiscal } from "@/types/consults";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { toast } from "sonner";
import StepsContainer from "../components/steps-container";

export default function ClientRegistrarAvariasEtapa001() {

  // ============ HOOKS =============
  const { setPageTitle, setPageDescription, setShowBackButton } = useHeader();
  const [searchParams] = useSearchParams();

  const clienteCodigo = searchParams.get('codigo');
  const clienteNomeFantasia = searchParams.get('nome_fantasia');
  const clienteEndereco = searchParams.get('endereco');

  // ============= STATES =============
  const [cliente, setCliente] = useState<Cliente>();
  const [spinners, setSpinners] = useState({
    geral: false,
  });

  // ============ FILTERS ===========
  const [filters, setFilters] = useState({
    busca: '',
  });

  // ============ DATA ===========
  const [notasFiscais, setNotasFiscais] = useState<NotaFiscal[]>([]);
  const [notaFiscalSelecionada, setNotaFiscalSelecionada] = useState<NotaFiscal | null>(null);

  // ============= EFFECTS =============
  useEffect(() => {
    setPageTitle('Selecionar nota fiscal');
    setPageDescription('Selecione uma nota');
    setShowBackButton(true);

    setCliente({
      codigo: clienteCodigo || undefined,
      nome_fantasia: clienteNomeFantasia || undefined,
      endereco: clienteEndereco || undefined,
    } as Cliente)
  }, [setPageTitle, setPageDescription, setShowBackButton, cliente]);

  // ============ FETCHERS ===========
  const fetchNotasFiscais = async () => {
    try {

      setNotaFiscalSelecionada(null);
      setSpinners((prev) => ({ ...prev, geral: true }));

      const response = await axios.get<ApiResponse<NotaFiscal[]>>('/notas-fiscais');
      const { data } = response;
      if (data.success) {
        setNotasFiscais(data.data);
      } else {
        toast.error(data.message || "Erro ao carregar notas fiscais");
      }
    } catch (error) {
      toast.error("Erro ao carregar notas fiscais");
      console.error("Error loading notas fiscais:", error);
    } finally {
      setSpinners((prev) => ({ ...prev, geral: false }));
    }
  };

  return (
    <div className="space-y-10">

      {/* STEPS CONTAINER */}
      <StepsContainer ammount={4} current={1} />

      {/* CONSULTAR NOTAS FISCAIS */}
      <SearchPanel
        total={notasFiscais.length}
        placeholder="Pesquise notas fiscais pelo número ou código"
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        fetchData={fetchNotasFiscais}
      />

      {/* NOTAS FISCAIS LIST */}
      <div className="flex flex-col gap-3">
        {
          notasFiscais.map((nota, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>NF {nota.numero}</CardTitle>
              </CardHeader>
            </Card>
          ))
        }
      </div>
    </div>
  )
}