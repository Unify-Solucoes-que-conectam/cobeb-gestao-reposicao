import { useAuth } from "@/hooks/use-auth";
import { useHeader } from "@/hooks/use-header";
import React, { useEffect, useState } from "react";

import Loader from "@/components/custom/loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { avariaService, filialService } from "@/services/api.service";
import { Avaria, Filial } from "@/types/consults";
import { ArrowDownUpIcon, ArrowRightLeftIcon, Building2Icon, FolderOpenIcon, SearchIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import AvariaCard from "../../../components/custom/avaria-card";

interface Dashboard {
  total: number
  title: string
  icon: React.ReactNode
  className?: string
}

interface Filters {
  busca: string
  status: string
  filial: string
}

export default function AdminAvarias() {

  // =============== HOOKS   ===============
  const { setPageBreadcrumbs, notificationReceived } = useHeader();
  // o filtro de filial só existe no tenant "Geral"; numa filial a API já restringe os dados
  const { tenant } = useAuth();
  const filtroFilial = !tenant || tenant.geral;
  const [searchParams] = useSearchParams();
  const avariaFromUrl = searchParams.get('avaria') ?? '';

  // ============== FILTERS ===============
  const [filters, setFilters] = useState<Filters>({
    busca: avariaFromUrl,
    status: 'todas',
    filial: 'todas',
  });

  // ============= STATES ===============
  const [spinners, setSpinners] = useState({ geral: true });
  const [currentOrdenation, setCurrentOrdenation] = useState<"asc" | "desc">("asc");

  // =============== DADOS ===============
  const [avarias, setAvarias] = useState<Avaria[]>([]);
  const [orderedAvarias, setOrderedAvarias] = useState<Avaria[]>(avarias);
  const [filiais, setFiliais] = useState<Filial[]>([]);

  useEffect(() => {

    // definir título da página
    setPageBreadcrumbs([
      { title: "Avarias", href: "/admin/avarias" }
    ]);

    if (filtroFilial) fetchFiliais();
  }, [])

  useEffect(() => {
    setFilters(prev => prev.busca === avariaFromUrl ? prev : { ...prev, busca: avariaFromUrl });
  }, [avariaFromUrl]);

  const dashboards: Dashboard[] = [
    {
      total: orderedAvarias.flatMap(avaria => avaria.itens).filter(item => item.produto.tipo_avaria.codigo === '5').length,
      title: "Avariados",
      icon: <Trash2Icon size={20} />,
      className: "bg-amber-500/20 text-amber-500"
    },
    {
      total: orderedAvarias.flatMap(avaria => avaria.itens).filter(item => item.produto.tipo_avaria.codigo === '39').length,
      title: "Inversões",
      icon: <ArrowRightLeftIcon size={20} />,
      className: "bg-violet-500/20 text-violet-500"
    },
  ]

  // ============== HANDLERS ===============
  /**
   * Consultar avarias, filtrando por status (opcional)
   */
  const fetchAvarias = async ({ signal, silent = false }: { signal?: AbortSignal, silent?: boolean } = {}) => {
    if (!silent) {
      setSpinners(prev => ({ ...prev, geral: true }));
    }

    const response = await avariaService.read({ search: filters.busca, status: filters.status === 'todas' ? undefined : filters.status, filialId: filters.filial === 'todas' ? undefined : filters.filial }, signal);

    if (response.success) {
      setAvarias(response.data);
      setOrderedAvarias(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }

    if (!silent) {
      setSpinners(prev => ({ ...prev, geral: false }));
    }
  }

  /**
   * Consultar filiais
   */
  const fetchFiliais = async ({ signal }: { signal?: AbortSignal } = {}) => {
    setSpinners(prev => ({ ...prev, geral: true }));
    const response = await filialService.read({}, signal);

    if (response.success) {
      setFiliais(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar filiais');
    }

    setSpinners(prev => ({ ...prev, geral: false }));
  }

  // ============== FUNCTIONS ===============

  const order = (sortOrder: "asc" | "desc") => {
    setOrderedAvarias(prev => [...prev].sort((a, b) => {
      const dateA = a.created_at ?? a.data_emissao ?? "";
      const dateB = b.created_at ?? b.data_emissao ?? "";

      return sortOrder === "asc"
        ? dateA.localeCompare(dateB)
        : dateB.localeCompare(dateA);
    }))
  }

  // ============== Effects ===============
  useEffect(() => {

    // debounce para evitar múltiplas requisições em sequência ao digitar na busca
    const debounceTimeout = setTimeout(() => {
      fetchAvarias();
    }, avariaFromUrl && filters.busca === avariaFromUrl ? 0 : 500);

    return () => clearTimeout(debounceTimeout);
  }, [filters, avariaFromUrl]);

  useEffect(() => {
    if (notificationReceived > 0) {
      fetchAvarias({ silent: true });
    }
  }, [notificationReceived]);

  return (
    // altura fixa da área útil: título, filtros e indicadores ficam parados e só a lista de cards rola
    <div className="flex h-[calc(100dvh-var(--header-height)-6rem)] min-h-0 flex-col gap-6 overflow-hidden">
      <div className='flex shrink-0 items-center'>
        <h1 className='text-2xl font-bold'>Gestão de Avarias</h1>
      </div>

      <div className="flex shrink-0 justify-between items-center gap-3">
        <InputGroup className="h-10">
          <InputGroupInput placeholder="Buscar cliente ou ID da avaria..." value={filters.busca} onChange={(e) => setFilters(prev => ({ ...prev, busca: e.target.value }))} />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">{avarias.length} results</InputGroupAddon>
        </InputGroup>

        <Button onClick={() => fetchAvarias()}>
          <SearchIcon size={16} />
        </Button>

        <Select defaultValue="todos" onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="aguardando_aprovacao">Aguardando aprovação</SelectItem>
              <SelectItem value="aprovada">Aprovadas</SelectItem>
              <SelectItem value="reprovada">Reprovadas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {filtroFilial && (
        <Select defaultValue="todas" onValueChange={(value) => setFilters(prev => ({ ...prev, filial: value }))}>
          <SelectTrigger className="w-45">
            <Building2Icon size={18} className="text-muted-foreground" />
            <SelectValue placeholder="Filiais" />
          </SelectTrigger>
          <SelectContent>

            <SelectGroup>
              <SelectItem value="todas">Todas Filiais</SelectItem>
              {
                filiais.map((filial, index) => (
                  <SelectItem key={index} value={filial.id}>{filial.descricao}</SelectItem>
                ))
              }
            </SelectGroup>
          </SelectContent>
        </Select>
        )}

        <Button
          size="icon"
          onClick={() => {
            const newOrder = currentOrdenation === "asc" ? "desc" : "asc";
            setCurrentOrdenation(newOrder);
            order(newOrder);
          }}
        >
          <ArrowDownUpIcon />
        </Button>
      </div>

      <div className="flex shrink-0 gap-3">
        {
          dashboards.map((dash, index) => (
            <Card key={index} className="flex items-center w-full">
              <CardHeader className="p-4 pr-0">
                <div className={cn("p-2 rounded-md flex", dash.className)}>
                  {dash.icon}
                </div>
              </CardHeader>
              <CardContent className="flex flex-col justify-center h-full p-4">
                <p className="text-xl font-bold">{dash.total}</p>
                <p className="text-sm text-muted-foreground">{dash.title}</p>
              </CardContent>
            </Card>
          ))
        }
      </div>

      {
        spinners.geral ? (
          <Loader />
        ) : orderedAvarias.length === 0 ? (
          <div className='flex min-h-0 flex-1 flex-col items-center justify-center gap-2 p-4'>
            <div className='bg-gray-200 p-8 rounded-xl border-gray-300 border-2'>
              <FolderOpenIcon className='text-gray-500' size={32} strokeWidth={2} />
            </div>
            <div className='text-center space-y-2'>
              <p className='font-medium text-sm text-slate-900'>Nenhum registro encontrado</p>
              <p className='text-xs text-slate-500'>
                Não encontramos nenhum registro de avarias com os filtros aplicados.<br></br>
                Tente alterar os filtros ou a busca para encontrar o que procura.
              </p>
            </div>
          </div>
        ) : (
          // grade com scroll próprio: 1 coluna no celular, 2 a partir de telas médias.
          // - gap (não space-y): margens nos itens da grade deslocam os cards e eles invadem a linha de baixo
          // - content-start: as linhas ficam com a altura dos cards, sem esticar para preencher a área
          // - cards da mesma linha ficam com a mesma altura (h-full no card + stretch padrão da grade)
          <div className="min-h-0 content-start space-y-3 overflow-y-auto">
            {
              orderedAvarias.map((av) => (
                <AvariaCard key={av.id} data={av} reloadData={fetchAvarias} />
              ))
            }
          </div>
        )
      }
    </div >
  )
}
