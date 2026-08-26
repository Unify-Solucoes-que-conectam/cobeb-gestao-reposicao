import { useCallback, useMemo, useState } from 'react'

import { GridBody } from './GridBody'
import { GridHeader } from './GridHeader'
import type { ColumnDef, DataGridProps } from './types'
import { cn } from '@/lib/utils'
import { LoaderCircleIcon } from 'lucide-react'

/**
 * Calcula a string de gridTemplateColumns para CSS Grid
 *
 * @param columns - Definições das colunas
 * @param enableSelection - Se a coluna de checkbox está habilitada
 * @returns String para gridTemplateColumns (ex: "50px 1fr 200px minmax(100px, 1fr)")
 *
 * Regras de largura:
 * - Se width é um número, converte para pixels (ex: 150 -> "150px")
 * - Se width é uma string, usa diretamente (ex: "1fr", "minmax(100px, 200px)")
 * - Se width não é definido, usa "1fr" (distribui espaço igualmente)
 * - Checkbox column sempre tem 50px
 */
function calculateGridTemplateColumns<TData>(
  columns: ColumnDef<TData>[],
  enableSelection?: boolean
): string {
  const columnWidths = columns.map((column) => {
    if (column.width === undefined) {
      return '1fr'
    }

    if (typeof column.width === 'number') {
      return `${column.width}px`
    }

    return column.width
  })

  // Adiciona coluna de checkbox se habilitado
  if (enableSelection) {
    return `50px ${columnWidths.join(' ')}`
  }

  return columnWidths.join(' ')
}

/**
 * DataGrid - Componente de tabela baseado em divs
 *
 * Um componente de tabela acessível construído inteiramente com divs,
 * utilizando CSS Grid para layout e ARIA roles para acessibilidade.
 *
 * ## Arquitetura CSS Grid
 *
 * O layout utiliza CSS Grid em vez de tabelas HTML para:
 * 1. Maior flexibilidade no controle de larguras das colunas
 * 2. Scroll vertical apenas no corpo (tbody), mantendo header fixo
 * 3. Scroll horizontal sincronizado entre header e body
 *
 * A estrutura é:
 * ```
 * Container (div[role="table"]) - flex column, altura fixa/flexível
 *   └── Header (div[role="rowgroup"]) - sticky top, CSS Grid
 *         └── HeaderRow (div[role="row"]) - gridTemplateColumns
 *               └── HeaderCells (div[role="columnheader"])
 *   └── Body (div[role="rowgroup"]) - overflow-y-auto, flex-1
 *         └── Rows (div[role="row"]) - gridTemplateColumns
 *               └── Cells (div[role="cell"])
 * ```
 *
 * ## Scroll Behavior
 *
 * - O container externo tem overflow-x-auto para scroll horizontal
 * - O wrapper interno (flex column) garante que header + body se movam juntos
 * - Apenas o body tem overflow-y-auto para scroll vertical
 * - O header é sticky dentro do wrapper scrollável
 *
 * @template TData - Tipo dos dados da linha
 */
export function DataGrid<TData>({
  columns,
  data,
  getRowId,
  // Ordenação
  sorting,
  onSortingChange,
  enableMultiSort = false,
  // Filtragem
  filters,
  onFiltersChange,
  // Seleção
  enableSelection = false,
  selectedRows,
  onSelectionChange,
  isRowSelectable,
  // Estados de UI
  isLoading = false,
  emptyMessage = 'Nenhum resultado encontrado.',
  emptyComponent,
  // Estilização
  showVerticalLines = false,
  showHorizontalLines = true,
  height = 'auto',
  maxHeight,
  className,
  onRowClick,
  enableRowHover = true,
  enableStripedRows = true,
  emptyValuePlaceholder,
  // Reordenação de colunas
  enableColumnReorder = false,
  columnOrder: externalColumnOrder,
  onColumnOrderChange,
  rowClassName,
}: DataGridProps<TData>) {
  /**
   * Estado interno para ordem das colunas (usado se não for controlado externamente)
   */
  const [internalColumnOrder, setInternalColumnOrder] = useState<string[]>(() =>
    columns.map((col) => col.id)
  )

  /**
   * Ordem das colunas (controlada ou interna)
   */
  const columnOrder = externalColumnOrder ?? internalColumnOrder

  /**
   * Colunas ordenadas de acordo com columnOrder
   */
  const orderedColumns = useMemo(() => {
    if (!enableColumnReorder) return columns

    const columnMap = new Map(columns.map((col) => [col.id, col]))
    const ordered: ColumnDef<TData>[] = []

    // Adiciona colunas na ordem especificada
    for (const id of columnOrder) {
      const col = columnMap.get(id)
      if (col) {
        ordered.push(col)
        columnMap.delete(id)
      }
    }

    // Adiciona colunas que não estão na ordem (novas colunas)
    for (const col of columnMap.values()) {
      ordered.push(col)
    }

    return ordered
  }, [columns, columnOrder, enableColumnReorder])

  /**
   * Calcula o gridTemplateColumns memoizado
   * Isso garante que header e body tenham o mesmo layout
   */
  const gridTemplateColumns = useMemo(
    () => calculateGridTemplateColumns(orderedColumns, enableSelection),
    [orderedColumns, enableSelection]
  )

  /**
   * Filtra os dados localmente com base nos filtros aplicados
   * Esta é uma filtragem inline (segunda camada) que acontece no cliente
   */
  const filteredData = useMemo(() => {
    if (!filters || filters.length === 0) return data

    return data.filter((row) => {
      return filters.every((filter) => {
        const column = orderedColumns.find((col) => col.id === filter.columnId)
        if (!column) return true

        const accessor = column.accessor ?? column.id
        const cellValue = (row as Record<string, unknown>)[accessor as string]

        // Se o valor da célula é nulo ou undefined, não passa no filtro
        if (cellValue === null || cellValue === undefined) return false

        // Converte para string para comparação case-insensitive
        const cellString = String(cellValue).toLowerCase()
        const filterString = filter.value.toLowerCase()

        return cellString.includes(filterString)
      })
    })
  }, [data, filters, orderedColumns])

  /**
   * Calcula o estado do checkbox "selecionar todos"
   */
  const selectAllState = useMemo<'checked' | 'unchecked' | 'indeterminate'>(() => {
    if (!enableSelection || !selectedRows || filteredData.length === 0) {
      return 'unchecked'
    }

    // Filtra apenas linhas selecionáveis
    const selectableRows = isRowSelectable ? filteredData.filter(isRowSelectable) : filteredData

    if (selectableRows.length === 0) {
      return 'unchecked'
    }

    const selectedCount = selectableRows.filter((row) => selectedRows.has(getRowId(row))).length

    if (selectedCount === 0) {
      return 'unchecked'
    }

    if (selectedCount === selectableRows.length) {
      return 'checked'
    }

    return 'indeterminate'
  }, [enableSelection, selectedRows, filteredData, isRowSelectable, getRowId])

  /**
   * Manipula clique no "selecionar todos"
   */
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (!onSelectionChange) return

      const newSelection = new Set(selectedRows)

      // Filtra apenas linhas selecionáveis (usa filteredData para selecionar apenas os visíveis)
      const selectableRows = isRowSelectable ? filteredData.filter(isRowSelectable) : filteredData

      if (checked) {
        // Adiciona todas as linhas selecionáveis
        selectableRows.forEach((row) => {
          newSelection.add(getRowId(row))
        })
      } else {
        // Remove todas as linhas selecionáveis
        selectableRows.forEach((row) => {
          newSelection.delete(getRowId(row))
        })
      }

      onSelectionChange(newSelection)
    },
    [selectedRows, onSelectionChange, filteredData, isRowSelectable, getRowId]
  )

  /**
   * Manipula seleção individual de linha
   */
  const handleRowSelect = useCallback(
    (rowId: string | number, checked: boolean) => {
      if (!onSelectionChange) return

      const newSelection = new Set(selectedRows)

      if (checked) {
        newSelection.add(rowId)
      } else {
        newSelection.delete(rowId)
      }

      onSelectionChange(newSelection)
    },
    [selectedRows, onSelectionChange]
  )

  /**
   * Manipula reordenação de colunas
   */
  const handleColumnReorder = useCallback(
    (fromIndex: number, toIndex: number) => {
      const currentOrder = [...columnOrder]
      const [removed] = currentOrder.splice(fromIndex, 1)
      currentOrder.splice(toIndex, 0, removed)

      if (onColumnOrderChange) {
        onColumnOrderChange(currentOrder)
      } else {
        setInternalColumnOrder(currentOrder)
      }
    },
    [columnOrder, onColumnOrderChange]
  )

  /**
   * Calcula estilos do container
   */
  const containerStyle = useMemo(() => {
    const style: React.CSSProperties = {}

    if (height !== 'auto') {
      style.height = typeof height === 'number' ? `${height}px` : height
    }

    if (maxHeight) {
      style.maxHeight = typeof maxHeight === 'number' ? `${maxHeight}px` : maxHeight
    }

    return style
  }, [height, maxHeight])

  /**
   * Verifica se deve exibir estado vazio
   */
  const showEmpty = !isLoading && filteredData.length === 0

  return (
    <div
      role='table'
      aria-busy={isLoading}
      aria-rowcount={filteredData.length}
      aria-colcount={columns.length + (enableSelection ? 1 : 0)}
      className={cn(
        // Container principal
        'relative flex flex-col',
        'rounded-md border border-border',
        'bg-card shadow-sm',
        // Overflow controlado
        { 'overflow-hidden': isLoading },
        { 'overflow-auto': !isLoading },
        className
      )}
      style={containerStyle}
    >
      {/*
        Wrapper interno para sincronizar scroll horizontal
        Este div mantém header e body com a mesma largura mínima
      */}
      <div className='flex flex-col min-w-max'>
        {/* Header - sticky durante scroll vertical */}
        <div className='sticky top-0 z-10'>
          <GridHeader
            columns={orderedColumns}
            gridTemplateColumns={gridTemplateColumns}
            sorting={sorting}
            onSortingChange={onSortingChange}
            enableMultiSort={enableMultiSort}
            filters={filters}
            onFiltersChange={onFiltersChange}
            enableSelection={enableSelection}
            selectedRows={selectedRows}
            onSelectAll={handleSelectAll}
            selectAllState={selectAllState}
            showVerticalLines={showVerticalLines}
            enableColumnReorder={enableColumnReorder}
            onColumnReorder={handleColumnReorder}
          />
        </div>

        {/* Body */}
        {!showEmpty && (
          <GridBody
            columns={orderedColumns}
            data={filteredData}
            gridTemplateColumns={gridTemplateColumns}
            getRowId={getRowId}
            enableSelection={enableSelection}
            selectedRows={selectedRows}
            onRowSelect={handleRowSelect}
            isRowSelectable={isRowSelectable}
            showVerticalLines={showVerticalLines}
            showHorizontalLines={showHorizontalLines}
            onRowClick={onRowClick}
            enableRowHover={enableRowHover}
            enableStripedRows={enableStripedRows}
            emptyValuePlaceholder={emptyValuePlaceholder}
            rowClassName={rowClassName}
          />
        )}

        {/* Estado vazio */}
        {showEmpty && (
          <div role='rowgroup' className='flex-1 flex items-center justify-center min-h-50'>
            {emptyComponent ?? (
              <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                <p className='text-lg font-medium'>{emptyMessage}</p>
                <p className='text-sm'>Tente ajustar os filtros de busca.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay de loading */}
      {isLoading && (
        <div
          className={cn(
            'absolute inset-0',
            'flex items-center justify-center',
            'bg-background/50',
            'z-20'
          )}
          aria-live='polite'
        >
          <LoaderCircleIcon size={12}/>
        </div>
      )}
    </div>
  )
}

// Re-exporta tipos para conveniência
export type {
  Alignment, ColumnDef, DataGridProps, EmptyValuePlaceholder, FilterState, SortDirection, SortState, TextOverflow
} from './types'

