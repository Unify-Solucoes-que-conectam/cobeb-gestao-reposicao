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
  const { setPageBreadcrumbs } = useHeader();

  // ============== FILTERS ===============
  const [filters, setFilters] = useState<Filters>({
    busca: '',
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

    fetchFiliais();
  }, [])

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
  const fetchAvarias = async ({ signal }: { signal?: AbortSignal } = {}) => {
    setSpinners(prev => ({ ...prev, geral: true }));
    const response = await avariaService.read({ search: filters.busca, status: filters.status === 'todas' ? undefined : filters.status, filialId: filters.filial === 'todas' ? undefined : filters.filial }, signal);

    if (response.success) {
      setAvarias(response.data);
      setOrderedAvarias(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }

    setSpinners(prev => ({ ...prev, geral: false }));
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
    setOrderedAvarias(prev => [...prev].sort((a, b) => sortOrder === "asc" ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)))
  }

  // ============== Effects ===============
  useEffect(() => {

    // debounce para evitar múltiplas requisições em sequência ao digitar na busca
    const debounceTimeout = setTimeout(() => {
      fetchAvarias();
    }, 500);

    return () => clearTimeout(debounceTimeout);
  }, [filters]);

  return (
    <div className="flex flex-col gap-6 h-full">
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Gestão de Avarias</h1>
      </div>

      <div className="flex justify-between items-center gap-3">
        <InputGroup className="h-10">
          <InputGroupInput placeholder="Search..." onChange={(e) => setFilters(prev => ({ ...prev, busca: e.target.value }))} />
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

      <div className="flex gap-3">
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
          <div className='flex flex-col items-center justify-center h-full gap-2 p-4'>
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
          <div className="flex flex-col gap-3">
            {
              orderedAvarias.map((av, index) => (
                <AvariaCard key={index} data={av} reloadData={fetchAvarias} />
              ))
            }
          </div>
        )
      }
    </div >
  )
}