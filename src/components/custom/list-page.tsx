import type { ReactNode } from 'react'

import { DataGrid, type ColumnDef } from '@/components/custom/data-grid'
import { Paginacao } from '@/components/custom/paginacao'

interface ListPageProps<T> {
  title: string
  /** Botões ao lado do título (ex.: "Novo motorista", "Exportar") */
  actions?: ReactNode
  /** Barra de pesquisa e filtros (normalmente um SearchPanel) */
  search: ReactNode
  columns: ColumnDef<T>[]
  data: T[]
  getRowId: (row: T) => string | number
  loading: boolean
  emptyMessage: string
  pagination: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (size: number) => void
    /** Texto do rodapé, ex.: "12 motorista(s) encontrado(s)." */
    label: ReactNode
  }
}

/**
 * Layout padrão das listagens: título, pesquisa, tabela ocupando a altura
 * disponível (com cabeçalho fixo) e paginação no rodapé.
 */
export function ListPage<T>({ title, actions, search, columns, data, getRowId, loading, emptyMessage, pagination }: ListPageProps<T>) {
  return (
    <div className='flex h-[calc(100dvh-var(--header-height)-6rem)] min-h-0 flex-col gap-6 overflow-hidden'>
      <div className='flex shrink-0 flex-wrap items-center justify-between gap-3'>
        <h1 className='text-2xl font-bold'>{title}</h1>
        {actions}
      </div>

      <div className='shrink-0'>{search}</div>

      <div className='min-h-0 flex-1'>
        <DataGrid
          data={data}
          columns={columns}
          getRowId={getRowId}
          isLoading={loading}
          height='100%'
          emptyMessage={emptyMessage}
          emptyValuePlaceholder='-'
        />
      </div>

      <div className='shrink-0'>
        <Paginacao
          page={pagination.page}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={pagination.onPageChange}
          onPageSizeChange={pagination.onPageSizeChange}
        >
          {pagination.label}
        </Paginacao>
      </div>
    </div>
  )
}
