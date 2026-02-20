import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { Field } from '@/components/ui/field'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

import Loader from '@/components/custom/loader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tooltip } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { password_validations } from '@/pages/admin/gerenciar/usuarios/schemas'
import { KeyRoundIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { schema, type Schema } from './schemas'
import { useTheme } from '@/hooks/use-theme'

interface PasswordChangerDialogProps {
  user_id: string;
  onSuccess: () => void;
}
export default function PasswordChangerDialog({
  user_id,
  onSuccess
}: PasswordChangerDialogProps) {

  // =============== FORM ===============
  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: user_id,
      senha: '',
      confirmar_senha: '',
    },
    mode: 'onSubmit',
  })

  // =============== HOOKS ===============
  const { changePassword, user, signOut, loading } = useAuth()
  const { theme } = useTheme()

  // =============== STATES ===============
  const [spinner, setSpinner] = useState(false)
  const [open, setOpen] = useState(false)

  // =============== HANDLERS ===============
  const handleSubmit = async (data: Schema) => {
    setSpinner(true)
    try {
      const { success, message } = await changePassword(data)

      if (success) {

        // validando se o usuário que teve a senha alterada é o mesmo que está logado, para deslogar caso seja
        if (user?.id === user_id) {
          toast.warning(message || 'Sua senha foi alterada. Por favor, faça login novamente.')
          onSuccess()
          setTimeout(() => {
            signOut()
          }, 3000)
        } else {
          toast.success(message || 'Senha alterada com sucesso!')
          onSuccess()
          form.reset();
        }

      } else {
        toast.error(message || 'Falha ao alterar senha. Tente novamente.')
      }
    } catch (error) {
      console.error('Register error:', error)
      toast.error('Não foi possível fazer registro. Tente novamente.')
    } finally {
      setSpinner(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  useEffect(() => {
    if (!open) form.reset();
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Tooltip content="Clique para alterar a senha" color='warning' variant={ theme === 'dark' ? 'outline' : 'solid'}>
          <Button variant={ theme === 'dark' ? 'outline' : 'solid'} color='warning' size="icon">
            <KeyRoundIcon />
          </Button>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Alterar Senha</DialogTitle>
        </DialogHeader>
        <div className='h-full'>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>

              <FormField
                control={form.control}
                name='senha'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nova Senha</FormLabel>

                    <FormControl>
                      <PasswordInput {...field} placeholder='Digite sua senha' className='h-12' />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* info de preenchimento de senha */}
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

              <Field>
                <Button type='submit' className='cursor-pointer' onClick={form.handleSubmit(handleSubmit)} loading={spinner} disabled={spinner}>
                  Alterar Senha
                </Button>
              </Field>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
