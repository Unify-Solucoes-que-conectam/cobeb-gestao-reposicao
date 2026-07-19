import {
  MapIcon,
  PlusIcon,
  TagIcon
} from 'lucide-react'
import { useNavigate } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Cliente } from '@/types/consults'

interface ClienteCardProps {
  cliente: Cliente & {
    razao_social?: string
    status?: string
    categoria?: {
      id?: number
      descricao?: string
    }
    cidade?: string
    uf?: string
    mapa: {
      id: string
    }
  }
  type?: 'selected' | 'list'
  onClick?: () => void
}

export default function ClienteCard({ cliente, type = 'list', onClick }: ClienteCardProps) {
  const navigate = useNavigate()

  if (type === 'selected') {
    return (
      <Card className='flex flex-col bg-blue-50 border border-blue-600 rounded-2xl shadow-sm transition-all'>
        <div className='flex justify-between items-start p-4 gap-4'>
          <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
            <span className='text-xs font-semibold text-slate-500 uppercase truncate'>
              Cód {cliente.codigo}
            </span>
            <span className='text-base font-extrabold text-foreground uppercase leading-tight tracking-tight truncate'>
              {cliente.nome_fantasia}
            </span>
            <span className='text-xs font-medium text-slate-500 uppercase truncate'>
              {cliente.razao_social || 'RAZÃO SOCIAL NÃO INFORMADA'}
            </span>
          </div>

          <div className='flex flex-col items-end gap-2 shrink-0'>
            <Badge
              variant='outline'
              className='text-xs font-bold text-foreground bg-white border-slate-200 rounded-full px-3 py-0.5 whitespace-nowrap'
            >
              {cliente.qntd_notas_fiscais || 0} NFs
            </Badge>

            <Badge
              className={`text-xs font-bold border-none rounded-full px-2.5 py-0.5 tracking-wide shadow-none uppercase ${!cliente.pdv_ativo
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
            >
              {cliente.pdv_ativo ? 'ATIVO' : 'INATIVO'}
            </Badge>
          </div>
        </div>

        <div className='h-px bg-slate-200 mx-4' />

        <div className='flex justify-between items-end p-4 gap-4'>
          <div className='flex flex-col gap-1 flex-1 min-w-0'>
            <div className='flex items-center text-slate-500 text-xs gap-2'>
              <MapIcon className='size-4 shrink-0' strokeWidth={2} />
              <span className='uppercase font-medium truncate'>{cliente.endereco}</span>
            </div>
            <div className='flex items-center text-slate-500 text-xs gap-2'>
              <TagIcon className='size-4 shrink-0' strokeWidth={2} />
              <span className='uppercase font-medium truncate'>
                {cliente.categoria?.descricao || 'SEGMENTO'}
              </span>
            </div>
          </div>

          <div className='flex items-center justify-end shrink-0'>
            <span className='text-xs font-bold text-foreground uppercase'>
              {cliente.cidade && cliente.uf ? `${cliente.cidade}/${cliente.uf}` : 'CIDADE/UF'}
            </span>
          </div>
        </div>

        <div className='flex flex-col gap-3 px-4 pb-4 pt-2'>
          <Button
            className='w-full bg-primary text-white h-10 rounded-xl text-sm font-semibold shadow-sm'
            onClick={() =>
              navigate(`/client/avarias-registradas?clienteId=${cliente.id}&mapaId=${cliente.mapa.id}`, {
                state: { clienteInfo: cliente },
              })
            }
          >
            <PlusIcon className='size-5 mr-1' strokeWidth={2.5} />
            Registrar Avarias
          </Button>

          <Button
            className='w-full bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 h-10 rounded-xl text-sm font-semibold shadow-sm'
            variant='ghost'
            onClick={onClick}
          >
            Escolher outro
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className='flex flex-col bg-white border border-slate-200 rounded-2xl shadow-sm transition-all cursor-pointer'
      onClick={onClick}
    >
      <div className='flex justify-between items-start p-4 gap-4'>
        <div className='flex flex-col gap-0.5 flex-1 min-w-0'>
          <span className='text-xs font-semibold text-slate-500 uppercase truncate'>
            Cód {cliente.codigo}
          </span>
          <span className='text-base font-extrabold text-foreground uppercase leading-tight tracking-tight truncate'>
            {cliente.nome_fantasia}
          </span>
          <span className='text-xs font-medium text-slate-500 uppercase truncate'>
            {cliente.razao_social || 'RAZÃO SOCIAL NÃO INFORMADA'}
          </span>
        </div>

        <div className='flex flex-col items-end gap-2 shrink-0'>
          <Badge
            variant='outline'
            className='text-xs font-bold text-foreground bg-white border-slate-200 rounded-full px-3 py-0.5 whitespace-nowrap'
          >
            {cliente.qntd_notas_fiscais || 0} NFs
          </Badge>

          <Badge
            className={`text-xs font-bold border-none rounded-full px-2.5 py-0.5 tracking-wide shadow-none uppercase ${!cliente.pdv_ativo
              ? 'bg-red-100 text-red-700 hover:bg-red-200'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
          >
            {cliente.pdv_ativo ? 'ATIVO' : 'INATIVO'}
          </Badge>
        </div>
      </div>

      <div className='h-px bg-slate-200 mx-4' />

      <div className='flex justify-between items-end p-4 gap-4'>
        <div className='flex flex-col gap-1 flex-1 min-w-0'>
          <div className='flex items-center text-slate-500 text-xs gap-2'>
            <MapIcon className='size-4 shrink-0' strokeWidth={2} />
            <span className='uppercase font-medium truncate'>{cliente.endereco}</span>
          </div>
          <div className='flex items-center text-slate-500 text-xs gap-2'>
            <TagIcon className='size-4 shrink-0' strokeWidth={2} />
            <span className='uppercase font-medium truncate'>
              {cliente.categoria?.descricao || 'SEGMENTO'}
            </span>
          </div>
        </div>

        <div className='flex items-center justify-end shrink-0'>
          <span className='text-xs font-bold text-foreground uppercase'>
            {cliente.cidade && cliente.uf ? `${cliente.cidade}/${cliente.uf}` : 'CIDADE/UF'}
          </span>
        </div>
      </div>
    </Card>
  )
}
