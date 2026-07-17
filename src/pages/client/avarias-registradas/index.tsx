import { useEffect, useState } from 'react'

import { FolderOpenIcon, PlusIcon } from 'lucide-react'
import { useLocation, useNavigate, useSearchParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useHeader } from '@/hooks/mobile/use-header'
import axios from '@/lib/axios'
import { ApiResponse } from '@/types/api-response'
import { Avaria, Cliente } from '@/types/consults'

const avarias: Avaria[] = []

export default function ClientAvariasRegistradas() {
  // ============= HOOKS =============
  const navigate = useNavigate()
  const { setPageTitle, setPageDescription, setShowBackButton } = useHeader()
  const [searchParams] = useSearchParams()
  const clienteId = searchParams.get('clienteId')
  const location = useLocation()

  // ============= STATES =============
  const [cliente, setCliente] = useState<Cliente | undefined>(location.state?.clienteInfo)

  // ============= EFFECTS =============
  useEffect(() => {
    setShowBackButton(true)

    if (cliente) {
      setPageTitle(cliente.nome_fantasia || 'Registrar Avarias')
      setPageDescription(`Cód: ${cliente.codigo} • ${cliente.endereco}`)
    } else {
      // Fallback de segurança: se o usuário recarregar a página (F5), ou acessar a URL direto
      setPageTitle('Registrar Avarias')
      setPageDescription('Carregando informações...')

      if (clienteId) getClientDetails()
    }
  }, [setPageTitle, setPageDescription, cliente])

  // ============= HANDLERS =============
  const getClientDetails = async () => {
    try {
      const res = await axios.get<ApiResponse<Cliente>>(`/clientes/${clienteId}`, {
        params: {
          detalhar: true,
        },
      })

      const { data } = res.data

      if (res.data.success) {
        setCliente(data)
      }
    } catch (err) {
      toast.error(
        'Erro ao buscar detalhes do cliente. Contate o administrador do sistema caso o erro persista!'
      )
      console.error('Erro ao buscar detalhes do cliente', err)
    }
  }

  return (
    <div className='flex flex-1 flex-col min-h-0 w-full bg-slate-50'>
      <div className='flex justify-between items-center shrink-0 z-10'>
        <h1 className='text-sm font-semibold'>Avarias Registradas (0)</h1>
        <Select defaultValue='000'>
          <SelectTrigger className='w-32 h-9 text-sm bg-white'>
            <SelectValue placeholder='Tipos de Avaria' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='000'>Todos</SelectItem>
              <SelectItem value='avariado'>Avariado</SelectItem>
              <SelectItem value='faltante'>Faltante</SelectItem>
              <SelectItem value='inversao'>Inversão</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className='flex-1 flex flex-col min-h-0 w-full'>
        <ScrollArea className='h-full w-full [&>[data-radix-scroll-area-viewport]>div]:h-full'>
          {avarias.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full gap-2 p-4'>
              <div className='bg-gray-200 p-8 rounded-xl border-gray-300 border-2'>
                <FolderOpenIcon className='text-gray-500' size={32} strokeWidth={2} />
              </div>
              <div className='text-center space-y-2'>
                <p className='font-medium text-sm text-slate-900'>Nenhum registro encontrado</p>
                <p className='text-xs text-slate-500'>
                  Clique em &quot;Adicionar Avaria&quot; para cadastrar
                </p>
              </div>
            </div>
          ) : (
            /* SIMULAÇÂO */
            <div className='flex flex-col gap-4 p-4'>
              {avarias.map((avaria) => (
                <div
                  key={avaria.id}
                  className='bg-white p-4 rounded-lg shadow-sm border border-gray-200'
                >
                  <p className='font-medium text-sm text-slate-900'>{avaria.id}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator />

      <div className='shrink-0 p-4 border-t pb-[calc(1rem+env(safe-area-inset-bottom))]'>
        <Button
          variant='outline'
          className='w-full h-12 shadow-sm border-slate-200 hover:bg-slate-50'
          onClick={() =>
            navigate(
              `/client/registrar-avarias?codigo=${cliente?.codigo}&nome_fantasia=${cliente?.nome_fantasia}&endereco=${cliente?.endereco}`
            )
          }
        >
          <PlusIcon className='text-xs font-medium text-primary mr-2' />
          <span className='font-semibold text-primary'>Adicionar Avaria</span>
        </Button>
      </div>
    </div>
  )
}
