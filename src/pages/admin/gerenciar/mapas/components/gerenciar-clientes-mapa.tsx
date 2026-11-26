import { Option, Select } from "@/components/custom/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import { Tooltip } from "@/components/ui/tooltip"
import { clienteService, mapaService } from "@/services/api.service"
import { Cliente, Mapa } from "@/types/consults"
import { UsersIcon, XIcon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

interface GerenciarClientesMapaProps {
  mapa: Mapa
  reload: () => void
  /** motivo pelo qual a ação está indisponível (o botão aparece desabilitado) */
  bloqueio?: string
}

type ClienteMapa = Pick<Cliente, "id" | "codigo" | "nome_fantasia" | "razao_social">

const SEM_SELECAO: string[] = []

/**
 * Adiciona e remove os clientes vinculados ao mapa.
 * A busca considera apenas clientes da mesma filial (revenda) do mapa.
 */
export default function GerenciarClientesMapa(props: GerenciarClientesMapaProps) {

  // =============== STATES ===============
  const [open, setOpen] = useState(false)
  const [clientes, setClientes] = useState<ClienteMapa[]>([])
  const [encontrados, setEncontrados] = useState<ClienteMapa[]>([])
  const [salvando, setSalvando] = useState(false)
  const [buscaKey, setBuscaKey] = useState(0)

  const idsOriginais = props.mapa.clientes.map((c) => c.id).sort().join(",")
  const alterado = clientes.map((c) => c.id).sort().join(",") !== idsOriginais

  // ============= Effects ===============
  useEffect(() => {
    if (open) setClientes(props.mapa.clientes)
  }, [open, props.mapa.clientes])

  // =============== HANDLERS ===============
  const buscarClientes = useCallback(async (search: string): Promise<Option[]> => {
    const response = await clienteService.read({ search, filial: props.mapa.filial.id, limit: 50 })
    if (!response.success) return []

    setEncontrados(response.data)
    return response.data.map((c) => ({
      value: c.id,
      label: `[${c.codigo}] ${c.nome_fantasia}`,
    }))
  }, [props.mapa.filial.id])

  const adicionarCliente = (ids: string[]) => {
    const cliente = encontrados.find((c) => c.id === ids[0])
    if (!cliente) return

    if (clientes.some((c) => c.id === cliente.id)) {
      toast.info("Cliente já está no mapa")
    } else {
      setClientes((prev) => [...prev, cliente])
    }

    // remonta a busca para limpar a seleção
    setBuscaKey((k) => k + 1)
  }

  const removerCliente = (id: string) => {
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }

  const handleSubmit = async () => {
    setSalvando(true)

    try {
      const response = await mapaService.atualizarClientes({
        mapaId: props.mapa.id,
        clientes: clientes.map((c) => c.id),
      })

      if (response.success) {
        toast.success(response.message || "Clientes do mapa atualizados")
        setOpen(false)
        props.reload()
      } else {
        toast.error(response.message || "Erro ao atualizar os clientes do mapa")
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erro ao atualizar os clientes do mapa")
    } finally {
      setSalvando(false)
    }
  }

  // botão desabilitado não dispara eventos: o span mantém o tooltip com o motivo
  if (props.bloqueio) {
    return (
      <Tooltip content={props.bloqueio}>
        <span tabIndex={0} className="inline-flex">
          <Button variant="outline" size="icon" disabled aria-label="Alterar clientes">
            <UsersIcon />
          </Button>
        </span>
      </Tooltip>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip content="Alterar clientes">
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Alterar clientes">
            <UsersIcon />
          </Button>
        </DialogTrigger>
      </Tooltip>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Clientes do Mapa {props.mapa.codigo}</DialogTitle>
          <DialogDescription>
            Adicione ou remova os clientes vinculados a este mapa.
          </DialogDescription>
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label>Adicionar cliente</Label>
            <Select
              key={buscaKey}
              value={SEM_SELECAO}
              onChange={adicionarCliente}
              searchFn={buscarClientes}
              placeholder="Pesquise pelo código ou nome do cliente"
              emptyMessage="Nenhum cliente encontrado nesta filial."
              disabled={salvando}
            />
          </Field>

          <Field>
            <Label>Clientes vinculados ({clientes.length})</Label>
            <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
              {clientes.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground italic">Nenhum cliente vinculado.</p>
              ) : (
                clientes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                    <span className="truncate" title={c.razao_social}>
                      <span className="text-muted-foreground mr-1">[{c.codigo}]</span>
                      {c.nome_fantasia}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      aria-label={`Remover ${c.nome_fantasia}`}
                      onClick={() => removerCliente(c.id)}
                      disabled={salvando}
                    >
                      <XIcon size={16} />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </Field>
        </FieldGroup>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={salvando}>
              Cancelar
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="bg-emerald-500 hover:bg-emerald-500" disabled={!alterado || salvando} loading={salvando}>
            {salvando ? "Salvando..." : "Salvar clientes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
