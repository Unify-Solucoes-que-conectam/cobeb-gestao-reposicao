import { useEffect, useState } from 'react'

import { FolderOpenIcon, LoaderCircleIcon, PlusIcon } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import AvariaCard from '@/components/custom/avaria-card'
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
import { clienteService } from '@/services/api.service'
import { Avaria, Cliente } from '@/types/consults'

export default function ClientAvariasRegistradas() {
  // ============= HOOKS =============
  const navigate = useNavigate()
  const { setPageTitle, setPageDescription, setShowBackButton, setShowLogoutButton } = useHeader()
  const location = useLocation()

  // ============= STATES =============
  const cliente = location.state?.cliente as Cliente | undefined
  const [avarias, setAvarias] = useState<Avaria[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined)
  const [spinners, setSpinners] = useState({ geral: false })

  /**
   * Consultar avarias do cliente selecionado, filtrando por status (opcional)
   */
  const fetchAvarias = async ({ signal, status }: { signal?: AbortSignal; status?: string } = {}) => {
    setSpinners({ ...spinners, geral: true })
    const response = await clienteService.avarias({ id: cliente?.id || '', status: status === 'todos' ? undefined : status }, signal);

    if (response.success) {
      setAvarias(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }
    setSpinners({ ...spinners, geral: false })
  }

  // ============= EFFECTS =============
  useEffect(() => {
    setShowBackButton(true)

    if (cliente) {
      setPageTitle(cliente.razao_social || 'Registrar Avarias')
      setPageDescription(`Cód: ${cliente.codigo} • ${cliente.endereco}`)
      setShowLogoutButton(false)
    } else {
      // Fallback de segurança: se o usuário recarregar a página (F5), ou acessar a URL direto
      setPageTitle('Registrar Avarias')
      setPageDescription('Carregando informações...')
    }
  }, [setPageTitle, setPageDescription, cliente])

  useEffect(() => {
    fetchAvarias({ status: selectedStatus });
  }, [selectedStatus])

  return (
    <div className='flex flex-1 flex-col min-h-0 w-full bg-slate-50'>
      <div className='flex justify-between items-center shrink-0 z-10'>
        <h1 className='text-sm font-semibold'>Avarias Registradas ({avarias.length})</h1>
        <Select defaultValue='todos' onValueChange={(value) => setSelectedStatus(value)}>
          <SelectTrigger className='w-32 h-9 text-sm bg-white'>
            <SelectValue placeholder='Tipos de Avaria' />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value='todos'>Todas</SelectItem>
              <SelectItem value='pendente'>Pendentes</SelectItem>
              <SelectItem value='enviada'>Enviadas</SelectItem>
              <SelectItem value='aprovada'>Aprovadas</SelectItem>
              <SelectItem value='reprovada'>Reprovadas</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className='flex-1 flex flex-col min-h-0 w-full'>
        <ScrollArea className='h-full w-full [&>[data-radix-scroll-area-viewport]>div]:h-full'>
          {spinners.geral ? (
            <div className='flex flex-col items-center justify-center h-full gap-2 p-4'>
              <LoaderCircleIcon className='animate-spin' size={32} strokeWidth={2} />
              Carregando histórico de avarias...
            </div>
          ) : avarias.length === 0 ? (
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
            <div className='flex flex-col gap-4 mt-3'>
              {avarias.map((avaria) => (
                <AvariaCard key={avaria.id} data={avaria} reloadData={fetchAvarias} />
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
          onClick={() => navigate('/client/registrar-avarias', {
            state: { cliente },
          })}
        >
          <PlusIcon className='text-xs font-medium text-primary mr-2' />
          <span className='font-semibold text-primary'>Adicionar Avaria</span>
        </Button>
      </div>
    </div>
  )
}
