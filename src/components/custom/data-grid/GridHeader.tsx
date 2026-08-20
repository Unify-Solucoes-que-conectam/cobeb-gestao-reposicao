import { memo, useCallback, useMemo, useRef, useState } from 'react'
import { Reorder, useDragControls } from 'framer-motion'

import { Checkbox } from '@/components/ui/checkbox'

import type { Alignment, ColumnDef, GridHeaderProps, SortDirection, SortState } from './types'
import { ChevronDownIcon, ChevronsUpDownIcon, ChevronUpIcon, GripVerticalIcon, MinusIcon, SearchIcon, XIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Mapeia alinhamento para classes CSS de justify-content
 */
const alignmentToJustify: Record<Alignment, string> = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
}

/**
 * Mapeia alinhamento para classes CSS de text-align
 */
const alignmentToText: Record<Alignment, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

/**
 * Componente de ícone de ordenação
 */
function SortIcon({ direction }: { direction?: SortDirection }) {
  if (!direction) {
    return <ChevronsUpDownIcon className='size-4 opacity-50' />
  }

  return direction === 'asc' ? (
    <ChevronUpIcon className='size-4' />
  ) : (
    <ChevronDownIcon className='size-4' />
  )
}

/**
 * Célula do cabeçalho individual
 *
 * Versão com filtro discreto inline - o filtro aparece ao clicar no ícone de busca,
 * substituindo o título temporariamente por um input.
 */
interface HeaderCellProps<TData> {
  column: ColumnDef<TData>
  columnIndex: number
  totalColumns: number
  sorting?: SortState[]
  onSortClick?: (columnId: string, isMultiSort: boolean) => void
  filterValue?: string
  onFilterChange?: (columnId: string, value: string) => void
  filterTrigger?: 'onChange' | 'onEnter'
  showVerticalLines?: boolean
  enableColumnReorder?: boolean
  dragControls?: ReturnType<typeof useDragControls>
  enableColumnResize?: boolean
  onResizeColumn?: (columnId: string, width: number) => void
}

function HeaderCellInner<TData>({
  column,
  columnIndex,
  totalColumns,
  sorting,
  onSortClick,
  filterValue,
  onFilterChange,
  filterTrigger = 'onChange',
  showVerticalLines,
  enableColumnReorder,
  dragControls,
  enableColumnResize,
  onResizeColumn,
}: HeaderCellProps<TData>) {
  const align = column.headerAlign ?? 'left'
  const inputRef = useRef<HTMLInputElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)
  const isResizing = useRef(false)
  const resizeStartX = useRef(0)
  const resizeStartWidth = useRef(0)

  // Estado para controlar se o filtro está expandido
  const [isFilterExpanded, setIsFilterExpanded] = useState(false)

  // Estado draft para o modo 'onEnter' (valor local antes de confirmar com Enter)
  const [draftValue, setDraftValue] = useState(filterValue ?? '')

  // Encontra o estado de ordenação desta coluna
  const sortState = sorting?.find((s) => s.columnId === column.id)
  const sortIndex = sorting?.findIndex((s) => s.columnId === column.id)
  const isMultiSorted = sorting && sorting.length > 1

  // Verifica se há filtro ativo
  const hasActiveFilter = filterValue && filterValue.length > 0

  // Handler de ordenação - agora só funciona ao clicar no botão
  const handleSortClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (column.sortable && onSortClick) {
        onSortClick(column.id, e.shiftKey)
      }
    },
    [column.id, column.sortable, onSortClick]
  )

  const handleFilterChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      if (filterTrigger === 'onEnter') {
        // Em modo onEnter, apenas atualiza o rascunho local
        setDraftValue(value)
      } else {
        onFilterChange?.(column.id, value)
      }
    },
    [column.id, onFilterChange, filterTrigger]
  )

  const handleFilterToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      const expanding = !isFilterExpanded
      setIsFilterExpanded(expanding)
      if (expanding) {
        // Inicializa o rascunho com o valor comprometido ao abrir
        setDraftValue(filterValue ?? '')
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    },
    [isFilterExpanded, filterValue]
  )

  const handleClearFilter = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      setDraftValue('')
      onFilterChange?.(column.id, '')
      setIsFilterExpanded(false)
    },
    [column.id, onFilterChange]
  )

  const handleFilterKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        // Restaura o rascunho para o valor comprometido e fecha
        setDraftValue(filterValue ?? '')
        setIsFilterExpanded(false)
      } else if (e.key === 'Enter') {
        // Previne submit de formulários pai
        e.preventDefault()
        if (filterTrigger === 'onEnter') {
          // Commita o valor do rascunho
          onFilterChange?.(column.id, draftValue)
        }
        // Não fecha o filtro ao pressionar Enter
      }
    },
    [filterValue, filterTrigger, draftValue, column.id, onFilterChange]
  )

  const handleFilterBlur = useCallback(() => {
    // Fecha o filtro se não houver valor (comprometido ou rascunho) ao perder foco
    const hasValue = filterTrigger === 'onEnter' ? draftValue || filterValue : filterValue
    if (!hasValue) {
      setIsFilterExpanded(false)
    }
  }, [filterValue, filterTrigger, draftValue])

  const handleFilterFocus = useCallback(() => {
    // Re-expande e sincroniza o rascunho ao focar quando o filtro está visível mas não expandido
    if (!isFilterExpanded) {
      setIsFilterExpanded(true)
      setDraftValue(filterValue ?? '')
    }
  }, [isFilterExpanded, filterValue])

  // Determina se deve mostrar borda direita
  const showBorderRight = showVerticalLines && columnIndex < totalColumns - 1

  // Determina se a coluna pode ser redimensionada
  const canResize = enableColumnResize && column.resizable !== false

  const handleResizePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    e.currentTarget.setPointerCapture(e.pointerId)
    isResizing.current = true
    resizeStartX.current = e.clientX
    resizeStartWidth.current = cellRef.current?.getBoundingClientRect().width ?? 150
  }, [])

  const handleResizePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isResizing.current) return
      const delta = e.clientX - resizeStartX.current
      const newWidth = Math.max(50, resizeStartWidth.current + delta)
      onResizeColumn?.(column.id, newWidth)
    },
    [column.id, onResizeColumn]
  )

  const handleResizePointerUp = useCallback((_e: React.PointerEvent<HTMLDivElement>) => {
    isResizing.current = false
  }, [])

  return (
    <div
      ref={cellRef}
      role='columnheader'
      aria-sort={sortState ? (sortState.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn(
        'flex items-center gap-1 px-3 py-2',
        'bg-muted font-semibold text-sm',
        'min-w-0 relative', // relative para o resize handle absoluto
        canResize && 'group/cell',
        showBorderRight && 'border-r border-border'
      )}
      style={{
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
    >
      {/* Drag handle para reordenação */}
      {enableColumnReorder && dragControls && (
        <button
          type='button'
          className={cn(
            'p-0.5 rounded shrink-0 cursor-grab active:cursor-grabbing',
            'text-muted-foreground/40 hover:text-muted-foreground',
            'hover:bg-muted-foreground/10',
            'transition-colors touch-none'
          )}
          onPointerDown={(e) => {
            e.preventDefault()
            dragControls.start(e)
          }}
          title='Arrastar para reordenar'
        >
          <GripVerticalIcon className='size-4' />
        </button>
      )}
      {/* Conteúdo do cabeçalho */}
      <div className={cn('flex items-center gap-1 flex-1 min-w-0', alignmentToJustify[align])}>
        {/* Modo normal: mostra título apenas quando não há filtro ativo e não está expandido */}
        {!isFilterExpanded && !hasActiveFilter && (
          <span className={cn('truncate', alignmentToText[align])}>{column.header}</span>
        )}

        {/* Modo filtro: mostra input quando expandido ou há filtro ativo */}
        {(isFilterExpanded || hasActiveFilter) && column.filterable && (
          <>
            {column.filterComponent ? (
              column.filterComponent({
                value: filterValue ?? '',
                onChange: (value) => onFilterChange?.(column.id, value),
                columnId: column.id,
              })
            ) : (
              <input
                ref={inputRef}
                type='text'
                value={
                  filterTrigger === 'onEnter' && isFilterExpanded ? draftValue : (filterValue ?? '')
                }
                onChange={handleFilterChange}
                onKeyDown={handleFilterKeyDown}
                onBlur={handleFilterBlur}
                onFocus={handleFilterFocus}
                placeholder={column.filterPlaceholder ?? `Filtrar ${column.header}...`}
                className={cn(
                  'flex-1 min-w-0 bg-transparent',
                  'text-sm font-normal',
                  'outline-none border-none',
                  'placeholder:text-muted-foreground/60'
                )}
                onClick={(e: React.MouseEvent) => e.stopPropagation()}
              />
            )}
          </>
        )}
      </div>
      {/* Botões de ação (ordenação e filtro) */}
      <div className='flex items-center gap-0.5 shrink-0'>
        {/* Botão de ordenação - isolado */}
        {column.sortable && !isFilterExpanded && !hasActiveFilter && (
          <button
            type='button'
            onClick={handleSortClick}
            className={cn(
              'p-0.5 rounded',
              'hover:bg-muted-foreground/10',
              'transition-colors',
              sortState ? 'text-primary' : 'text-muted-foreground/60 hover:text-muted-foreground'
            )}
            title={`Ordenar por ${column.header}${sortState ? ` (${sortState.direction === 'asc' ? 'crescente' : 'decrescente'})` : ''}`}
          >
            <SortIcon direction={sortState?.direction} />
          </button>
        )}

        {/* Índice de ordenação múltipla */}
        {column.sortable &&
          isMultiSorted &&
          sortIndex !== undefined &&
          sortIndex >= 0 &&
          !isFilterExpanded &&
          !hasActiveFilter && (
            <span className='text-xs text-muted-foreground font-normal'>{sortIndex + 1}</span>
          )}

        {/* Botão de filtro */}
        {column.filterable && (
          <>
            {hasActiveFilter ? (
              <button
                type='button'
                onClick={handleClearFilter}
                className={cn(
                  'p-0.5 rounded',
                  'text-primary hover:text-primary/80',
                  'hover:bg-primary/10',
                  'transition-colors'
                )}
                title='Limpar filtro'
              >
                <XIcon className='size-3.5' />
              </button>
            ) : (
              <button
                type='button'
                onClick={handleFilterToggle}
                className={cn(
                  'p-0.5 rounded',
                  'text-muted-foreground/60 hover:text-muted-foreground',
                  'hover:bg-muted-foreground/10',
                  'transition-colors',
                  isFilterExpanded && 'text-primary'
                )}
                title='Filtrar coluna'
              >
                <SearchIcon className='size-3.5' />
              </button>
            )}
          </>
        )}
      </div>

      {/* Handle de redimensionamento */}
      {canResize && (
        <div
          aria-hidden='true'
          className={cn(
            'absolute right-0 top-0 h-full w-1',
            'cursor-col-resize select-none touch-none',
            'flex items-center justify-center',
            'z-10'
          )}
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        >
          <div
            className={cn(
              'h-4 w-px rounded-full',
              'bg-transparent group-hover/cell:bg-border',
              'transition-colors duration-150'
            )}
          />
        </div>
      )}
    </div>
  )
}

// Memoização do componente de célula
const HeaderCell = memo(HeaderCellInner) as typeof HeaderCellInner

/**
 * Wrapper para HeaderCell com suporte a drag & drop
 */
interface DraggableHeaderCellProps<TData> extends Omit<HeaderCellProps<TData>, 'dragControls'> {
  columnWidth: string
}

function DraggableHeaderCellWrapper<TData>(props: DraggableHeaderCellProps<TData>) {
  const dragControls = useDragControls()

  return (
    <Reorder.Item
      value={props.column.id}
      dragListener={false}
      dragControls={dragControls}
      style={{ gridColumn: 'span 1' }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      whileDrag={{
        scale: 1.02,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: 50,
      }}
      layout
      layoutId={props.column.id}
    >
      <HeaderCell {...props} dragControls={dragControls} />
    </Reorder.Item>
  )
}

/**
 * GridHeader - Cabeçalho do DataGrid
 *
 * Responsável por renderizar:
 * - Checkbox de "selecionar todos"
 * - Títulos das colunas com ordenação
 * - Filtros inline discretos
 *
 * Utiliza CSS Grid para alinhar as colunas com o corpo da tabela.
 * O cabeçalho é sticky (posicionado fixamente) durante o scroll vertical.
 */
function GridHeaderInner<TData>({
  columns,
  gridTemplateColumns,
  sorting,
  onSortingChange,
  enableMultiSort,
  filters,
  onFiltersChange,
  filterTrigger,
  enableSelection,
  selectAllState,
  onSelectAll,
  showVerticalLines,
  enableColumnReorder,
  onColumnReorder,
  enableColumnResize,
  onColumnResize,
}: GridHeaderProps<TData>) {
  /**
   * Manipula o clique de ordenação em uma coluna.
   * Implementa lógica de ordenação simples e múltipla.
   */
  const handleSortClick = useCallback(
    (columnId: string, isMultiSort: boolean) => {
      if (!onSortingChange) return

      const currentSorting = sorting ?? []
      const existingIndex = currentSorting.findIndex((s) => s.columnId === columnId)
      const existingSort = currentSorting[existingIndex]

      // Lógica de ordenação múltipla (Shift+Click)
      if (enableMultiSort && isMultiSort) {
        if (existingSort) {
          // Cicla entre: asc -> desc -> remove
          if (existingSort.direction === 'asc') {
            const newSorting = [...currentSorting]
            newSorting[existingIndex] = { columnId, direction: 'desc' }
            onSortingChange(newSorting)
          } else {
            // Remove da ordenação
            onSortingChange(currentSorting.filter((s) => s.columnId !== columnId))
          }
        } else {
          // Adiciona nova ordenação
          onSortingChange([...currentSorting, { columnId, direction: 'asc' }])
        }
      } else {
        // Ordenação simples (substitui ordenação existente)
        if (existingSort) {
          if (existingSort.direction === 'asc') {
            onSortingChange([{ columnId, direction: 'desc' }])
          } else {
            // Remove ordenação
            onSortingChange([])
          }
        } else {
          onSortingChange([{ columnId, direction: 'asc' }])
        }
      }
    },
    [sorting, onSortingChange, enableMultiSort]
  )

  /**
   * Manipula mudança de filtro em uma coluna.
   */
  const handleFilterChange = useCallback(
    (columnId: string, value: string) => {
      if (!onFiltersChange) return

      const currentFilters = filters ?? []
      const existingIndex = currentFilters.findIndex((f) => f.columnId === columnId)

      if (value === '') {
        // Remove filtro vazio
        onFiltersChange(currentFilters.filter((f) => f.columnId !== columnId))
      } else if (existingIndex >= 0) {
        // Atualiza filtro existente
        const newFilters = [...currentFilters]
        newFilters[existingIndex] = { columnId, value }
        onFiltersChange(newFilters)
      } else {
        // Adiciona novo filtro
        onFiltersChange([...currentFilters, { columnId, value }])
      }
    },
    [filters, onFiltersChange]
  )

  /**
   * Manipula clique no checkbox "selecionar todos"
   */
  const handleSelectAllChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      onSelectAll?.(checked === true)
    },
    [onSelectAll]
  )

  /**
   * Cria mapa de valores de filtro para acesso rápido
   */
  const filterValues = useMemo(() => {
    const map: Record<string, string> = {}
    filters?.forEach((f) => {
      map[f.columnId] = f.value
    })
    return map
  }, [filters])

  /**
   * IDs das colunas para Reorder.Group
   */
  const columnIds = useMemo(() => columns.map((col) => col.id), [columns])

  /**
   * Handler para reordenação
   */
  const handleReorder = useCallback(
    (newOrder: string[]) => {
      if (!onColumnReorder) return

      // Encontra os índices que mudaram
      const oldOrder = columns.map((col) => col.id)
      let fromIndex = -1
      let toIndex = -1

      for (let i = 0; i < newOrder.length; i++) {
        if (newOrder[i] !== oldOrder[i]) {
          if (fromIndex === -1) {
            // Encontra o índice original do item que se moveu
            fromIndex = oldOrder.indexOf(newOrder[i])
            toIndex = i
          }
        }
      }

      if (fromIndex !== -1 && toIndex !== -1) {
        onColumnReorder(fromIndex, toIndex)
      }
    },
    [columns, onColumnReorder]
  )

  return (
    <div
      role='rowgroup'
      className={cn(
        'border-b-2 border-border',
        'bg-muted' // Header totalmente opaco
      )}
    >
      {/*
        Linha do cabeçalho usando CSS Grid
        O gridTemplateColumns é calculado no componente pai para garantir
        sincronização com o corpo da tabela
      */}
      <div role='row' className='grid' style={{ gridTemplateColumns }}>
        {/* Checkbox de selecionar todos */}
        {enableSelection && (
          <div
            role='columnheader'
            aria-label='Selecionar todos'
            className={cn(
              'flex items-center justify-center px-3 py-2',
              'bg-muted', // Também opaco
              showVerticalLines && 'border-r border-border'
            )}
          >
            <Checkbox
              checked={selectAllState === 'checked'}
              ref={(el) => {
                if (el) {
                  // Define estado indeterminado via DOM
                  const input = el.querySelector('input') ?? el
                  if (input instanceof HTMLButtonElement) {
                    input.dataset.state =
                      selectAllState === 'indeterminate'
                        ? 'indeterminate'
                        : selectAllState === 'checked'
                          ? 'checked'
                          : 'unchecked'
                  }
                }
              }}
              onCheckedChange={handleSelectAllChange}
              aria-label={
                selectAllState === 'checked'
                  ? 'Desmarcar todos'
                  : selectAllState === 'indeterminate'
                    ? 'Alguns selecionados'
                    : 'Selecionar todos'
              }
              className={cn(
                selectAllState === 'indeterminate' &&
                  'data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground'
              )}
            >
              {selectAllState === 'indeterminate' && (
                <MinusIcon className='size-3.5' />
              )}
            </Checkbox>
          </div>
        )}

        {/* Células do cabeçalho */}
        {enableColumnReorder ? (
          <Reorder.Group axis='x' values={columnIds} onReorder={handleReorder} className='contents'>
            {columns.map((column, index) => (
              <DraggableHeaderCellWrapper
                key={column.id}
                column={column}
                columnIndex={index}
                totalColumns={columns.length}
                sorting={sorting}
                onSortClick={handleSortClick}
                filterValue={filterValues[column.id]}
                onFilterChange={handleFilterChange}
                filterTrigger={filterTrigger}
                showVerticalLines={showVerticalLines}
                enableColumnReorder={enableColumnReorder}
                enableColumnResize={enableColumnResize}
                onResizeColumn={onColumnResize}
                columnWidth={
                  column.width === undefined
                    ? '1fr'
                    : typeof column.width === 'number'
                      ? `${column.width}px`
                      : column.width
                }
              />
            ))}
          </Reorder.Group>
        ) : (
          columns.map((column, index) => (
            <HeaderCell
              key={column.id}
              column={column}
              columnIndex={index}
              totalColumns={columns.length}
              sorting={sorting}
              onSortClick={handleSortClick}
              filterValue={filterValues[column.id]}
              onFilterChange={handleFilterChange}
              filterTrigger={filterTrigger}
              showVerticalLines={showVerticalLines}
              enableColumnResize={enableColumnResize}
              onResizeColumn={onColumnResize}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Exporta com memoização para evitar re-renders desnecessários
export const GridHeader = memo(GridHeaderInner) as typeof GridHeaderInner
