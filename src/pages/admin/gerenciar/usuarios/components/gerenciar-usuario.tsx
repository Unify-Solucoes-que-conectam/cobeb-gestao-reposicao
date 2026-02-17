import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "@/lib/axios";
import { cn } from "@/lib/utils";
import { ApiResponse } from "@/types/api-response";
import { Usuario } from "@/types/app";
import { capitalizeName, formatCPF } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2Icon, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { password_validations, schema, Schema } from "../schemas";

interface GerenciarUsuarioProps {
  user?: Usuario
  onSubmit?: () => void
}
export default function GerenciarUsuario({ user, onSubmit }: GerenciarUsuarioProps) {

  // ============== HOOKS ==============
  const [open, setOpen] = useState(false);

  // ============== STATES ==============
  const [loading, setLoading] = useState(false)

  // ============== FORM ==============
  const form = useForm<Schema>({
    resolver: zodResolver(schema(!!user)),
    defaultValues: {
      cpf: user?.cpf || '',
      nome: user?.nome || '',
      senha: '',
      confirmar_senha: '',
      tipo: user?.role || 'monitoramento',
    },
    mode: 'onSubmit',
  })

  // ============== HANDLERS ==============

  const handleSubmit = async (values: Schema) => {
    try {

      setLoading(true);

      if (user) {
        const response = await axios.patch<ApiResponse>(`/usuarios/${user.id}`, values);
        const { data } = response;

        if (data.success) {
          form.reset();
          toast.success(data.message || 'Usuário atualizado com sucesso!');
          setOpen(false);
          onSubmit?.();
        } else {
          toast.error(data.debug_errors?.cpf?.[0] || data.message || 'Erro ao editar usuário');
        }
      } else {
        const response = await axios.post<ApiResponse>('/auth/register', values);
        const { data } = response;

        if (data.success) {
          form.reset();
          toast.success(data.message || 'Usuário criado com sucesso!');
          setOpen(false);
          onSubmit?.();
        } else {
          toast.error(data.debug_errors?.cpf?.[0] || data.message || 'Erro ao criar usuário');
        }
      }
    } catch (error) {
      toast.error("Erro ao atualizar usuário")
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    form.reset();
    setOpen(isOpen);
  }

  const findUser = async () => {
    try {

      const response = await axios.get<ApiResponse<Usuario[]>>(`/usuarios/${form.getValues('cpf')}`);
      const { data } = response;

      if (data.success) {

        if (form.getValues('cpf') === user?.cpf || form.getValues('cpf') === '') {
          form.clearErrors('cpf');
          return;
        };

        form.setError('cpf', {
          type: 'manual',
          message: 'CPF já cadastrado para outro usuário',
        });
      } else {
        form.clearErrors('cpf');
      }
    } catch {
      form.clearErrors('cpf');
    }
  };

  // ============== VALIDAÇÕES =============
  const userExists = form.watch('cpf');

  useEffect(() => {
    if (form.getValues('cpf').length === 11) findUser();
  }, [userExists])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {
          !user ? (
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          ) : (
            <Button color='warning'>
              <Edit2Icon className="h-4 w-4 mr-2" />
              Editar
            </Button>
          )
        }
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{user ? 'Editar' : 'Cadastrar'} Usuário</DialogTitle></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>

            <FormField
              control={form.control}
              name='tipo'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tipo</FormLabel>

                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="monitoramento">Monitoramento</SelectItem>
                          <SelectItem value="motorista">Motorista</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
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
                    <Input value={capitalizeName(field.value) || ''} onChange={(e) => field.onChange(e.target.value.toLowerCase())} placeholder='Digite seu nome' className='h-12' />
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

            {
              !user && (
                <FormField
                  control={form.control}
                  name='senha'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Senha</FormLabel>

                      <FormControl>
                        <PasswordInput {...field} placeholder='Digite sua senha' className='h-12' />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }

            {
              !user && (
                <FormField
                  control={form.control}
                  name='confirmar_senha'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Confirmar Senha</FormLabel>

                      <FormControl>
                        <PasswordInput {...field} placeholder='Digite sua senha' className='h-12' />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            }

            {/* info de preenchimento de senha */}
            {
              !user && (
                <Card className='p-3 gap-3'>
                  <CardHeader className='p-0'>
                    <CardTitle className="text-md pb-3">Sua nova senha precisa:</CardTitle>
                  </CardHeader>
                  <CardContent className='p-0'>
                    <ul className='text-sm text-muted-foreground space-y-1'>
                      {password_validations(form.watch('senha') || '', form.watch('confirmar_senha') || '').map(
                        (validation) => (
                          <li
                            key={validation.title}
                            className={cn({
                              'text-green-600 dark:text-green-500': validation.validation,
                              'text-red-600 dark:text-red-500': !validation.validation,
                            })}
                          >
                            {validation.validation ? '✅' : '❌'} {validation.message}
                          </li>
                        )
                      )}
                    </ul>
                  </CardContent>
                </Card>
              )
            }

            <Button className="w-full" loading={loading} disabled={loading || !form.formState.isValid || !form.formState.isDirty} type="submit">
              Salvar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}