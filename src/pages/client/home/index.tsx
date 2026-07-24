import { useEffect, useState } from 'react'

import { MapMinusIcon } from 'lucide-react'
import { toast } from 'sonner'

import Loader from '@/components/custom/loader'
import SearchPanel from '@/components/custom/search-panel'
import { useHeader } from '@/hooks/mobile/use-header'
import { useAuth } from '@/hooks/use-auth'
import { Cliente } from '@/types/consults'

import ClienteCard from './components/cliente-card'
import DetectClientCard from './components/detect-client-card'
import { mapaService } from '@/services/api.service'

export default function ClientHome() {
  // ============ HOOKS ===========
  const { setShowBackButton, setPageDescription, setPageTitle, setShowLogoutButton } = useHeader()
  const { user } = useAuth()

  // ============ STATES ===========
  const [switched, setSwitched] = useState(false)
  const [spinners, setSpinners] = useState({
    geral: false,
  })

  // ============ FILTERS ===========
  const [filters, setFilters] = useState({
    busca: '',
  })

  // ============ DATA ===========
  const [clientes, setClients] = useState<Cliente[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [clienteDetectado, setClienteDetectado] = useState<Cliente | null>(null)

  // ============ EFFECTS ===========
  useEffect(() => {
    setShowBackButton(false)
    setPageTitle(user?.nome ? user.nome : 'Bem-vindo!')
    setPageDescription('')
    setShowLogoutButton(true)
  }, [])

  // ============ FETCHERS ===========
  const fetchClients = async ({ signal }: { signal?: AbortSignal } = {}) => {

    // validar se os dados necessários estão disponíveis
    if (!user?.motorista.mapa.id) {
      return
    }

    setSpinners({ ...spinners, geral: true })
    const response = await mapaService.clientes({ id: user?.motorista.mapa.id || '' }, signal);

    if (response.success) {
      setClients(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar clientes');
    }
    setSpinners({ ...spinners, geral: false })
  }

  // useEffect para consultar dados iniciais
  useEffect(() => {

    const controller = new AbortController();
    const signal = controller.signal;

    fetchClients({ signal });
  }, [])

  return (
    <div className='flex flex-col h-full space-y-3'>
      <DetectClientCard
        clientes={clientes}
        selected={clienteSelecionado}
        onSelect={(cliente) => !clienteSelecionado && setClienteSelecionado(cliente)}
        currentDetected={clienteDetectado}
        detectedClient={(cliente) => {
          if (!switched) {
            setClienteSelecionado(cliente)
            setClienteDetectado(cliente)
          }
        }}
      />

      <SearchPanel
        total={clientes.length}
        placeholder='Pesquise clientes pelo nome ou código'
        search={filters.busca}
        onSearchChange={(search) => setFilters({ ...filters, busca: search })}
        fetchData={fetchClients}
      />

      <div className='flex-1 flex flex-col min-h-0 space-y-2 overflow-y-auto'>
        {spinners.geral ? (
          <Loader />
        ) : clienteSelecionado ? (
          <ClienteCard
            key={clienteSelecionado.id}
            cliente={clienteSelecionado}
            type='selected'
            onClick={() => {
              setClienteSelecionado(null)
              setSwitched(true)
            }}
          />
        ) : clientes.length === 0 ? (
          //Lista Vazia
          <div className='flex-1 flex flex-col items-center justify-center gap-4'>
            <div className='bg-slate-200/70 p-4 rounded-2xl'>
              <MapMinusIcon className='w-8 h-8 text-slate-500 shrink-0' strokeWidth={1.5} />
            </div>
            <div className='text-center space-y-1'>
              <p className='font-semibold text-sm text-slate-900'>Nenhum registro encontrado</p>
              <p className='text-xs text-slate-500'>Nenhum cliente designado no mapa</p>
            </div>
          </div>
        ) : (
          // Lista de Clientes
          clientes.map((cliente) => (
            <ClienteCard
              key={cliente.id}
              cliente={cliente}
              onClick={() => setClienteSelecionado(cliente)}
            />
          ))
        )}
      </div>
    </div>
  )
}
