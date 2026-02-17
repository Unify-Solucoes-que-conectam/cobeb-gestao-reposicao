import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input, PasswordInput } from "@/components/ui/input";
import axios from "@/lib/axios";
import { ApiResponse } from "@/types/api-response";
import { formatCPF } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { defaultValues, schema, Schema } from "../schemas";
import { Usuario } from "@/types/app";

interface GerenciarUsuarioProps {
  initialData: Usuario
}
export default function GerenciarUsuario({ initialData }: GerenciarUsuarioProps) {

  // ============== HOOKS ==============
  const [open, setOpen] = useState(false);

  // ============== STATES ==============
  const [loading, setLoading] = useState(false)

  // ============== FORM ==============
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues({
      ...initialData,
      senha: ''
    }),
    mode: 'onSubmit',
  })

  const handleSubmit = async (values: Schema) => {
    try {
      setLoading(true);

      if (initialData) {
        const response = await axios.put<ApiResponse>(`/users/${initialData.id}`, values);
        const { data } = response;

        if (data.success) {
          toast.success(data.message || `Usuário ${initialData ? 'atualizado' : 'criado'} com sucesso!`);
        }
      }


    } catch (error) {
      toast.error("Erro ao atualizar usuário")
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><PlusIcon className="h-4 w-4 mr-2" /> Novo Usuário</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Cadastrar Usuário</DialogTitle></DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name='nome'
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Nome</FormLabel>

                  <FormControl>
                    <Input placeholder='Digite seu nome' className='h-12' {...field} />
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
            <Button className="w-full" loading={loading} disabled={loading} type="submit">
              Adicionar
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}