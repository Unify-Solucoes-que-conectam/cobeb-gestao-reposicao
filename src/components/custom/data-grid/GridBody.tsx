import { memo, useCallback } from 'react'

import { GridRow } from './GridRow'
import type { GridBodyProps } from './types'
import { cn } from '@/lib/utils'

/**
 * GridBody - Corpo do DataGrid
 *
 * Responsável por renderizar:
 * - Container para as linhas
 * - Linhas de dados com suporte a seleção
 *
 * O scroll vertical é controlado pelo container principal do DataGrid,
 * com o header fixo (sticky) durante a rolagem.
 */
function GridBodyInner<TData>({
  columns,
  data,
  gridTemplateColumns,
  getRowId,
  enableSelection,
  selectedRows,
  onRowSelect,
  isRowSelectable,
  showVerticalLines,
  showHorizontalLines,
  onRowClick,
  enableRowHover,
  enableStripedRows,
  emptyValuePlaceholder,
  rowClassName,
}: GridBodyProps<TData>) {
  /**
   * Cria callback de seleção para uma linha específica
   */
  const createRowSelectHandler = useCallback(
    (rowId: string | number) => (checked: boolean) => {
      onRowSelect?.(rowId, checked)
    },
    [onRowSelect]
  )

  /**
   * Cria callback de clique para uma linha específica
   */
  const createRowClickHandler = useCallback(
    (row: TData, rowIndex: number) => () => {
      onRowClick?.(row, rowIndex)
    },
    [onRowClick]
  )

  return (
    <div
      role='rowgroup'
      className={cn(
        // Adiciona borda superior se não houver linhas horizontais
        // para separar do header
        !showHorizontalLines && 'border-t border-border'
      )}
    >
      {data.map((row, rowIndex) => {
        const rowId = getRowId(row)
        const isSelected = selectedRows?.has(rowId) ?? false
        const isSelectable = isRowSelectable?.(row) ?? true
        const isStriped = enableStripedRows && rowIndex % 2 === 1

        return (
          <GridRow
            key={rowId}
            row={row}
            rowIndex={rowIndex}
            columns={columns}
            gridTemplateColumns={gridTemplateColumns}
            rowId={rowId}
            enableSelection={enableSelection}
            isSelected={isSelected}
            onSelect={createRowSelectHandler(rowId)}
            isSelectable={isSelectable}
            showVerticalLines={showVerticalLines}
            showHorizontalLines={showHorizontalLines}
            onClick={onRowClick ? createRowClickHandler(row, rowIndex) : undefined}
            enableRowHover={enableRowHover}
            isStriped={isStriped}
            emptyValuePlaceholder={emptyValuePlaceholder}
            className={rowClassName?.(row, rowIndex)}
          />
        )
      })}
    </div>
  )
}

// Exporta com memoização para evitar re-renders desnecessários
export const GridBody = memo(GridBodyInner) as typeof GridBodyInner
