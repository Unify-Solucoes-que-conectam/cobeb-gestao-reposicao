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
import { formatCPF } from '@/utils/formatters'
import { useState } from 'react'
import { defaultValues, schema, type Schema } from './schemas'

export default function AuthPage() {

  // =========== EFFECTS ===========
  const params = new URLSearchParams(window.location.search)

  const form = useForm<Schema>({
    resolver: zodResolver(schema(params.get('register') === 'true')),
    defaultValues: defaultValues,
    mode: 'onSubmit',
  })

  const navigate = useNavigate()
  const { signIn, signUp, loading, isAuthenticated } = useAuth()

  const [spinner, setSpinner] = useState(false)

  // Redirect if already authenticated
  if (isAuthenticated) {
    navigate('/admin/avarias')
    return null
  }

  // =========== HANDLERS ===========
  const handleSubmit = async (data: Schema) => {
    setSpinner(true)
    if (params.get('register') === 'true') {
      try {
        const { success, message } = await signUp(data)

        if (!success) {
          toast.error(message)
          return
        }

        navigate('/admin/avarias')
      } catch (error) {
        console.error('Register error:', error)
        toast.error('Não foi possível fazer registro. Tente novamente.')
      } finally {
        setSpinner(false)
      }
    } else {
      try {
        const { success } = await signIn(data.cpf, data.senha)

        if (!success) {
          return
        }

        navigate('/admin/avarias')
      } catch (error) {
        console.error('Login error:', error)
        toast.error('Não foi possível fazer login. Tente novamente.')
      } finally {
        setSpinner(false)
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
      <div className='flex-1 flex flex-col items-center justify-center px-10 border-slate-200'>
        <Card className='w-full max-w-lg'>
          <CardHeader className='items-center gap-4'>
            <Logo className='w-50 h-full' />
          </CardHeader>
          <CardContent>
            <div className='h-full'>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-6'>

                  {
                    params.get('register') === 'true' && (
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
                    )
                  }

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

                  <Field className='flex justify-center bg-primary rounded-2xl'>
                    <Button type='submit' className='cursor-pointer' onClick={form.handleSubmit(handleSubmit)} loading={spinner} disabled={spinner}>
                      Entrar
                    </Button>
                  </Field>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className='p-4 text-center text-xs text-muted-foreground'>
        Powered by Unify Soluções
      </footer>
    </div>
  )
}
