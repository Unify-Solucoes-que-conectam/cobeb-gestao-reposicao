import { DatePicker } from "@/components/custom/date-picker";
import Loader from "@/components/custom/loader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tooltip } from "@/components/ui/tooltip";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { Cluster, Filial, Motorista } from "@/types/consults";
import { formatCPF, formatPhoneDisplay, unformatPhone } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2Icon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultValues, schema, Schema } from "../schemas";

interface GerenciarMotoristaProps {
  driver?: Motorista
  onSubmit?: () => void
}
export default function GerenciarMotorista({ driver, onSubmit }: GerenciarMotoristaProps) {

  // ============== HOOKS ==============
  const [open, setOpen] = useState(false);

  // ============== STATES ==============
  const [loading, setLoading] = useState({
    geral: false,
    filiais: false,
    clusters: false,
  })
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [clusters, setClusters] = useState<Cluster[]>([]);

  // ============== FORM ==============
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues(driver),
    mode: 'onSubmit',
  })

  // ============== HANDLERS ==============

  const handleSubmit = async (values: Schema) => {
    try {

      setLoading((prev) => ({ ...prev, geral: true }));

      if (driver) {
        const response = await axios.patch<ApiResponse>(`/motoristas/${driver.id}`, values);
        const { data } = response;

        if (data.success) {
          form.reset();
          toast.success(data.message || 'Motorista atualizado com sucesso!');
          setOpen(false);
          onSubmit?.();
        } else {
          toast.error(data.debug_errors?.cpf?.[0] || data.message || 'Erro ao editar motorista');
        }
      } else {
        const response = await axios.post<ApiResponse>('/auth/register', values);
        const { data } = response;

        if (data.success) {
          form.reset();
          toast.success(data.message || 'Motorista criado com sucesso!');
          setOpen(false);
          onSubmit?.();
        } else {
          toast.error(data.debug_errors?.cpf?.[0] || data.message || 'Erro ao criar motorista');
        }
      }
    } catch (error) {
      toast.error("Erro ao atualizar motorista")
      console.error("Error updating motorista:", error);
    } finally {
      setLoading((prev) => ({ ...prev, geral: false }));
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    form.reset();
    setOpen(isOpen);
  }

  const findDriver = async () => {
    try {

      const response = await axios.get<ApiResponse<Motorista[]>>(`/motoristas/${form.getValues('cpf')}`);
      const { data } = response;

      if (data.success) {

        if (form.getValues('cpf') === driver?.cpf || form.getValues('cpf') === '') {
          form.clearErrors('cpf');
          return;
        };

        form.setError('cpf', {
          type: 'manual',
          message: 'CPF já cadastrado para outro motorista',
        });
      } else {
        form.clearErrors('cpf');
      }
    } catch {
      form.clearErrors('cpf');
    }
  };

  // função para buscar filiais
  const handleFiliais = async () => {
    // spinner de carregamento
    setLoading((prev) => ({ ...prev, filiais: true }));

    // requisição com axios
    const res = await axios.get<ApiResponse<Filial[]>>(`/filiais`);

    // verificar se a requisição foi bem sucedida
    if (res.data.success) {
      // reload data
      setFiliais(res.data.data);
    } else {
      // toast de erro
      toast.error(res.data.message);
    }

    // remover spinner de carregamento
    setLoading((prev) => ({ ...prev, filiais: false }));
  };

  // função para buscar clusters
  const handleClusters = async () => {
    // spinner de carregamento
    setLoading((prev) => ({ ...prev, clusters: true }));

    // requisição com axios
    const res = await axios.get<ApiResponse<Cluster[]>>(`/clusters`);

    // verificar se a requisição foi bem sucedida
    if (res.data.success) {
      // reload data
      setClusters(res.data.data);
    } else {
      // toast de erro
      toast.error(res.data.message);
    }

    // remover spinner de carregamento
    setLoading((prev) => ({ ...prev, clusters: false }));
  };

  // ============== VALIDAÇÕES =============
  const driverExists = form.watch('cpf');

  // ============== EFFECTS ===============
  useEffect(() => {
    if (!open) return;

    handleFiliais();
    handleClusters();
  }, [open])

  useEffect(() => {
    if (!open) return;
    if (form.getValues('cpf').length === 11) findDriver();
  }, [driverExists])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {
          !driver ? (
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Motorista
            </Button>
          ) : (
            <Tooltip content="Clique para editar" color="warning">
              <Button color='warning' size="icon">
                <Edit2Icon />
              </Button>
            </Tooltip>
          )
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{driver ? 'Editar' : 'Cadastrar'} Motorista</DialogTitle></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>

            <FormField
              control={form.control}
              name='codigo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Codigo</FormLabel>

                  <FormControl>
                    <Input
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder='Digite o código do motorista'
                      className='h-12'
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome</FormLabel>

                  <FormControl>
                    <Input
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder='Digite seu nome'
                      className='h-12'
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='cpf'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>CPF</FormLabel>

                  <FormControl>
                    <Input
                      placeholder="000.000.000-00"
                      className="h-12"
                      maxLength={14}
                      value={formatCPF(field.value || '')}
                      onChange={(e) => {
                        const onlyNumbers = e.target.value.replace(/\D/g, '')
                        field.onChange(onlyNumbers)
                      }}
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='status'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Status</FormLabel>

                  <FormControl>
                    <div className='flex items-center justify-between gap-2 border border-input rounded-md h-12 px-3'>
                      <span className='text-sm text-muted-foreground'>{field.value === 'ativo' ? 'Ativo' : 'Inativo'}</span>
                      <Switch
                        checked={field.value === 'ativo'}
                        onCheckedChange={(checked) => field.onChange(checked ? 'ativo' : 'inativo')}
                      />
                    </div>
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='celular_corporativo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Celular Corporativo</FormLabel>
                  <FormControl>
                    <Input
                      className="h-12"
                      placeholder='(00) 00000-0000'
                      maxLength={15}
                      value={formatPhoneDisplay(field.value || '')}
                      onChange={(e) => {
                        const unformatted = unformatPhone(e.target.value)
                        if (unformatted.length <= 11) {
                          field.onChange(unformatted)
                        }
                      }}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="data_admissao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Data Admissão</FormLabel>
                  <FormControl>
                    <DatePicker
                      className="h-12 w-full"
                      placeholder="Selecione a data de admissão"
                      date={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="filial_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Filial</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={loading.filiais}
                    >
                      <SelectTrigger
                        loadingMessage="Carregando Filiais"
                        className="w-full truncate h-12!"
                      >
                        {loading.filiais && <Loader className="mx-0 flex-row gap-3" showMessage message="Carregando filiais"/>}
                        <SelectValue placeholder="Selecione uma filial" />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          !loading.filiais && filiais.map((filial) => (
                            <SelectItem key={filial.id} value={String(filial.id)}>
                              {filial.descricao}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cluster_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Cluster</FormLabel>
                  <FormControl>
                    <Select
                      defaultValue={field.value ? String(field.value) : ""}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={loading.clusters}
                    >
                      <SelectTrigger
                        loadingMessage="Carregando Clusters"
                        className="w-full truncate h-12!"
                      >
                        {loading.clusters && <Loader className="mx-0 flex-row gap-3" showMessage message="Carregando clusters"/>}
                        <SelectValue placeholder="Selecione um cluster" />
                      </SelectTrigger>
                      <SelectContent>
                        {
                          !loading.clusters && (
                            clusters.map((cluster) => (
                              <SelectItem key={cluster.id} value={String(cluster.id)}>
                                {cluster.descricao}
                              </SelectItem>
                            ))
                          )
                        }
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button className="w-full" loading={loading.geral} disabled={loading.geral || !form.formState.isDirty} type="submit">
              Salvar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}