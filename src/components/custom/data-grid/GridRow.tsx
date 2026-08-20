import { memo, useCallback } from 'react'

import { Checkbox } from '@/components/ui/checkbox'

import type {
  Alignment,
  ColumnDef,
  EmptyValuePlaceholder,
  GridRowProps,
  TextOverflow,
} from './types'
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
 * Mapeia textOverflow para classes CSS
 */
const textOverflowClasses: Record<TextOverflow, string> = {
  truncate: 'truncate',
  wrap: 'whitespace-normal break-words',
}

/**
 * Obtém o valor de uma célula a partir do accessor
 * Suporta notação de ponto (ex: 'user.name')
 */
function getCellValue<TData>(row: TData, accessor: string): unknown {
  const keys = accessor.split('.')
  let value: unknown = row

  for (const key of keys) {
    if (value === null || value === undefined) return undefined
    value = (value as Record<string, unknown>)[key]
  }

  return value
}

/**
 * Célula individual de uma linha
 */
interface GridCellProps<TData> {
  column: ColumnDef<TData>
  row: TData
  rowIndex: number
  columnIndex: number
  totalColumns: number
  showVerticalLines?: boolean
  emptyValuePlaceholder?: EmptyValuePlaceholder
}

/**
 * Verifica se um valor é considerado vazio (null, undefined ou string vazia)
 */
function isEmptyValue(value: unknown): boolean {
  return value === null || value === undefined || value === ''
}

function GridCellInner<TData>({
  column,
  row,
  rowIndex,
  columnIndex,
  totalColumns,
  showVerticalLines,
  emptyValuePlaceholder,
}: GridCellProps<TData>) {
  const align = column.cellAlign ?? 'left'
  const textOverflow = column.textOverflow ?? 'truncate'
  const accessor = column.accessor ?? column.id
  const value = getCellValue(row, accessor as string)

  // Determina se deve mostrar borda direita
  const showBorderRight = showVerticalLines && columnIndex < totalColumns - 1

  // Conteúdo da célula
  let content: React.ReactNode

  if (column.renderCell) {
    // Se tem renderCell customizado, usa ele
    content = column.renderCell(value, row, rowIndex)
  } else if (isEmptyValue(value)) {
    // Se o valor é vazio e tem placeholder, mostra o placeholder
    content =
      emptyValuePlaceholder !== undefined ? (
        <span className='text-muted-foreground'>{emptyValuePlaceholder}</span>
      ) : (
        ''
      )
  } else {
    // Valor normal
    content = String(value)
  }

  return (
    <div
      role='cell'
      className={cn(
        'flex items-center px-3 py-2',
        'text-sm min-w-0', // min-w-0 permite truncamento
        alignmentToJustify[align],
        alignmentToText[align],
        showBorderRight && 'border-r border-border'
      )}
      style={{
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
      }}
    >
      <span className={cn('w-full', textOverflowClasses[textOverflow])}>{content}</span>
    </div>
  )
}

const GridCell = memo(GridCellInner) as typeof GridCellInner

/**
 * GridRow - Linha individual do DataGrid
 *
 * Responsável por renderizar:
 * - Checkbox de seleção (opcional)
 * - Células de dados
 *
 * Utiliza CSS Grid para alinhar com o cabeçalho.
 * Suporta estados de hover, seleção e listras alternadas.
 */
function GridRowInner<TData>({
  row,
  rowIndex,
  columns,
  gridTemplateColumns,
  rowId: _rowId,
  enableSelection,
  isSelected,
  onSelect,
  isSelectable = true,
  showVerticalLines,
  showHorizontalLines,
  onClick,
  enableRowHover,
  isStriped,
  emptyValuePlaceholder,
}: GridRowProps<TData>) {
  /**
   * Manipula mudança no checkbox de seleção
   */
  const handleCheckboxChange = useCallback(
    (checked: boolean | 'indeterminate') => {
      if (isSelectable && onSelect) {
        onSelect(checked === true)
      }
    },
    [isSelectable, onSelect]
  )

  /**
   * Manipula clique na linha
   * Evita propagar se clicar no checkbox
   */
  const handleRowClick = useCallback(
    (e: React.MouseEvent) => {
      // Não dispara se clicar no checkbox
      if ((e.target as HTMLElement).closest('[data-slot="checkbox"]')) {
        return
      }
      onClick?.()
    },
    [onClick]
  )

  return (
    <div
      role='row'
      aria-selected={isSelected}
      className={cn(
        'grid transition-colors',
        // Borda horizontal inferior
        showHorizontalLines && 'border-b border-border',
        // Listras alternadas
        isStriped && 'bg-muted/30',
        // Hover
        enableRowHover && 'hover:bg-muted/60',
        // Seleção
        isSelected && 'bg-primary/10',
        // Cursor clicável
        onClick && 'cursor-pointer'
      )}
      style={{ gridTemplateColumns }}
      onClick={handleRowClick}
    >
      {/* Checkbox de seleção */}
      {enableSelection && (
        <div
          role='cell'
          className={cn(
            'flex items-center justify-center px-3 py-2',
            showVerticalLines && 'border-r border-border'
          )}
        >
          {isSelectable && (
            <Checkbox
              checked={isSelected}
              onCheckedChange={handleCheckboxChange}
              aria-label={`Selecionar linha ${rowIndex + 1}`}
            />
          )}
        </div>
      )}

      {/* Células de dados */}
      {columns.map((column, columnIndex) => (
        <GridCell
          key={column.id}
          column={column}
          row={row}
          rowIndex={rowIndex}
          columnIndex={columnIndex}
          totalColumns={columns.length}
          showVerticalLines={showVerticalLines}
          emptyValuePlaceholder={emptyValuePlaceholder}
        />
      ))}
    </div>
  )
}

// Exporta com memoização para evitar re-renders desnecessários
export const GridRow = memo(GridRowInner) as typeof GridRowInner
