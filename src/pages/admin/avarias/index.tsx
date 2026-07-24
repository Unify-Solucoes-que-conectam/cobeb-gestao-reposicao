import { useHeader } from "@/hooks/use-header";
import React, { useEffect, useState } from "react";

import { DatePicker } from "@/components/custom/date-picker";
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
import { avariaService } from "@/services/api.service";
import { Avaria } from "@/types/consults";
import { ArrowDownUpIcon, ArrowRightLeftIcon, Building2Icon, SearchIcon, SquaresSubtractIcon, Trash2Icon } from "lucide-react";
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
  dataInicial?: Date
  dataFinal?: Date
}

export default function AdminAvarias() {

  // =============== HOOKS   ===============
  const { setPageBreadcrumbs } = useHeader();

  // ============== FILTERS ===============
  const [filters, setFilters] = useState<Filters>({
    busca: '',
    status: 'todas',
    filial: 'todas',
    dataInicial: undefined,
    dataFinal: undefined,
  });

  // ============= STATES ===============
  const [spinners, setSpinners] = useState({ geral: true });
  const [currentOrdenation, setCurrentOrdenation] = useState<"asc" | "desc">("asc");

  // =============== DADOS ===============
  const [avarias, setAvarias] = useState<Avaria[]>([]);
  const [orderedAvarias, setOrderedAvarias] = useState<Avaria[]>(avarias);

  useEffect(() => {

    // definir título da página
    setPageBreadcrumbs([
      { title: "Avarias", href: "/admin/avarias" }
    ]);

    fetchAvarias();
  }, [])

  const dashboards: Dashboard[] = [
    {
      total: 0,
      title: "Avariados",
      icon: <Trash2Icon size={20} />,
      className: "bg-red-400/20 text-red-500"
    },
    {
      total: 0,
      title: "Faltantes",
      icon: <SquaresSubtractIcon size={20} />,
      className: "bg-blue-400/20 text-blue-500"
    },
    {
      total: 0,
      title: "Inversões",
      icon: <ArrowRightLeftIcon size={20} />,
      className: "bg-orange-400/20 text-orange-500"
    },
  ]

  // ============== HANDLERS ===============
  /**
   * Consultar avarias, filtrando por status (opcional)
   */
  const fetchAvarias = async ({ signal, status }: { signal?: AbortSignal; status?: string } = {}) => {
    setSpinners(prev => ({ ...prev, geral: true }));
    const response = await avariaService.read({ status: status === 'todos' ? undefined : status }, signal);

    if (response.success) {
      setAvarias(response.data);
      setOrderedAvarias(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }

    setSpinners(prev => ({ ...prev, geral: false }));
  }

  // ============== FUNCTIONS ===============

  const order = (sortOrder: "asc" | "desc") => {
    setOrderedAvarias(prev => [...prev].sort((a, b) => sortOrder === "asc" ? a.created_at.localeCompare(b.created_at) : b.created_at.localeCompare(a.created_at)))
  }

  return (
    <div className="flex flex-col gap-6">
      <div className='flex items-center'>
        <h1 className='text-2xl font-bold'>Gestão de Avarias</h1>
      </div>

      <div className="flex justify-between items-center gap-3">
        <InputGroup className="h-10">
          <InputGroupInput placeholder="Search..." />
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupAddon align="inline-end">12 results</InputGroupAddon>
        </InputGroup>

        <Select defaultValue="todas">
          <SelectTrigger className="w-45">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="aguardando_analise">Aguardando Análise</SelectItem>
              <SelectItem value="em_analise">Em Análise</SelectItem>
              <SelectItem value="concluido">Concluídas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select defaultValue="000">
          <SelectTrigger className="w-45">
            <Building2Icon size={18} className="text-muted-foreground" />
            <SelectValue placeholder="Filiais" />
          </SelectTrigger>
          <SelectContent>

            <SelectGroup>
              <SelectItem value="000">Todas Filiais</SelectItem>
              <SelectItem value="001">COBEB - MATRIZ</SelectItem>
              <SelectItem value="002">COBEB - LAGOA</SelectItem>
              <SelectItem value="003">COBEB - RDC ABAETÉ</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        <DatePicker
          placeholder="De"
          date={filters.dataInicial}
          onSelect={(date) => setFilters((prev) => ({ ...prev, dataInicial: date }))}
          maxDate={filters.dataFinal}
        />
        <DatePicker
          placeholder="Até"
          date={filters.dataFinal}
          onSelect={(date) => setFilters((prev) => ({ ...prev, dataFinal: date }))}
          minDate={filters.dataInicial}
        />

        <Button
          onClick={() => {
            setFilters((prev) => ({ ...prev, dataInicial: undefined, dataFinal: undefined }));
          }}
        >Limpar</Button>

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

      {
        spinners.geral ? (
          <Loader />
        ) : (
          <>
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

            <div className="flex flex-col gap-3">
              {
                orderedAvarias.map((av, index) => (
                  <AvariaCard key={index} data={av} reloadData={fetchAvarias} />
                ))
              }
            </div>
          </>
        )
      }
    </div >
  )
}