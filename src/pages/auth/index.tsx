import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
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
import { Input, PasswordInput } from '@/components/ui/input'
import { useAuth } from '@/hooks/use-auth'

import Loader from '@/components/custom/loader'
import { Logo } from '@/components/custom/logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { defaultValues, schema, type Schema } from './schemas'
import { formatCPF } from '@/utils/formatters'

export default function AuthPage() {

  const params = new URLSearchParams(window.location.search)

  const form = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const navigate = useNavigate()
  const { signIn, signUp, loading, isAuthenticated } = useAuth()

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/dashboard')
    return null
  }

  const handleSubmit = async (data: Schema) => {
    if (params.get('register') === 'true') {
      try {
        const { success, message } = await signUp(data)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/dashboard')
      } catch (error) {
        console.error('Register error:', error)
        toast.error('Não foi possível fazer registro. Tente novamente.')
      }
    } else {
      try {
        const { success, message } = await signIn(data.cpf, data.password)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/dashboard')
      } catch (error) {
        console.error('Login error:', error)
        toast.error('Não foi possível fazer login. Tente novamente.')
      }
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Loader showMessage={true} />
      </div>
    )
  }

  return (
    <div className='flex flex-col h-screen'>
      <div className='h-full flex flex-col items-center justify-center py-10 px-10 gap-3'>
        <Card className='w-md'>
          <CardHeader className='items-center gap-2'>
            <Logo className='w-50 h-full' />
            <h2>Gestão de Reposição</h2>
          </CardHeader>
          <CardContent>
            <div className='h-full'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>

                  <FormField
                    control={form.control}
                    name='cpf'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel required>CPF</FormLabel>

                        <FormControl>
                          <Input
                            {...field}
                            placeholder="000.000.000-00"
                            className="h-12"
                            onChange={(e) => {
                              const formatted = formatCPF(e.target.value)
                              field.onChange(formatted)
                            }}
                          />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='password'
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

                  <Field>
                    <Button type='submit'>
                      Entrar
                    </Button>
                  </Field>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className='p-8 text-center text-xs text-muted-foreground'>
        Powered by IsmaelSantiago
      </footer>
    </div>
  )
}
