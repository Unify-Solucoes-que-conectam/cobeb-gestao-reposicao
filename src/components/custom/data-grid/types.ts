import type { ReactNode } from 'react'

/**
 * Placeholder para valores vazios nas células.
 * Pode ser uma string (ex: '-', 'N/A') ou um componente React.
 */
export type EmptyValuePlaceholder = string | ReactNode

/**
 * Alinhamento de conteúdo nas células
 */
export type Alignment = 'left' | 'center' | 'right'

/**
 * Comportamento de overflow de texto nas células
 */
export type TextOverflow = 'truncate' | 'wrap'

/**
 * Direção de ordenação
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Estado de ordenação de uma coluna
 */
export interface SortState {
  /** ID/accessor da coluna */
  columnId: string
  /** Direção da ordenação */
  direction: SortDirection
}

/**
 * Estado de filtro de uma coluna
 */
export interface FilterState {
  /** ID/accessor da coluna */
  columnId: string
  /** Valor do filtro */
  value: string
}

/**
 * Definição de uma coluna do DataGrid
 * @template TData - Tipo dos dados da linha
 */
export interface ColumnDef<TData> {
  /**
   * Identificador único da coluna.
   * Usado como chave de acesso aos dados se `accessor` não for fornecido.
   */
  id: string

  /**
   * Título exibido no cabeçalho.
   * Pode ser uma string ou um componente React.
   */
  header: string | ReactNode

  /**
   * Chave para acessar o valor nos dados.
   * Se não fornecido, usa o `id` como accessor.
   */
  accessor?: keyof TData | string

  /**
   * Função de renderização customizada para o conteúdo da célula.
   * Recebe o valor da célula, a linha completa e o índice.
   */
  renderCell?: (value: unknown, row: TData, rowIndex: number) => ReactNode

  /**
   * Alinhamento do conteúdo no cabeçalho.
   * @default 'left'
   */
  headerAlign?: Alignment

  /**
   * Alinhamento do conteúdo nas células do corpo.
   * @default 'left'
   */
  cellAlign?: Alignment

  /**
   * Largura da coluna para CSS Grid.
   *
   * Valores aceitos:
   * - Número: convertido para pixels (ex: 150 -> '150px')
   * - String CSS: usado diretamente (ex: '1fr', '200px', '20%')
   * - 'minmax(min, max)': define largura flexível com limites
   *
   * Dica para responsividade:
   * Use minmax() para colunas que precisam se adaptar:
   * - 'minmax(100px, 200px)' - largura entre 100px e 200px
   * - 'minmax(150px, 1fr)' - mínimo 150px, cresce se houver espaço
   * - 'minmax(100px, 300px)' - limita largura máxima do texto
   *
   * @default '1fr'
   */
  width?: string | number

  /**
   * Largura mínima da coluna em pixels.
   * Aplicado via CSS inline na célula.
   * @deprecated Prefira usar width com minmax() para melhor responsividade
   */
  minWidth?: number

  /**
   * Largura máxima da coluna em pixels.
   * Aplicado via CSS inline na célula.
   * @deprecated Prefira usar width com minmax() para melhor responsividade
   */
  maxWidth?: number

  /**
   * Comportamento do texto quando excede a largura da célula.
   * - 'truncate': corta o texto e exibe reticências (...)
   * - 'wrap': quebra o texto em múltiplas linhas
   * @default 'truncate'
   */
  textOverflow?: TextOverflow

  /**
   * Se a coluna pode ser ordenada.
   * @default false
   */
  sortable?: boolean

  /**
   * Se a coluna pode ser filtrada.
   * @default false
   */
  filterable?: boolean

  /**
   * Se a coluna pode ser redimensionada.
   * Requer enableColumnResize no DataGrid.
   * @default true
   */
  resizable?: boolean

  /**
   * Componente de filtro customizado.
   * Recebe o valor atual do filtro e a função para alterá-lo.
   */
  filterComponent?: (props: {
    value: string
    onChange: (value: string) => void
    columnId: string
  }) => ReactNode

  /**
   * Placeholder para o input de filtro padrão.
   */
  filterPlaceholder?: string

  /**
   * Texto exibido em tooltip ao passar o mouse sobre o cabeçalho.
   */
  headerTooltip?: string
}

/**
 * Props do componente DataGrid
 * @template TData - Tipo dos dados da linha
 */
export interface DataGridProps<TData> {
  /**
   * Definição das colunas.
   */
  columns: ColumnDef<TData>[]

  /**
   * Array de dados a serem exibidos.
   */
  data: TData[]

  /**
   * Função para extrair o ID único de cada linha.
   * Necessário para seleção e keys do React.
   */
  getRowId: (row: TData) => string | number

  // ==================== Ordenação ====================

  /**
   * Estado atual de ordenação (controlado externamente).
   */
  sorting?: SortState[]

  /**
   * Callback chamado quando a ordenação muda.
   */
  onSortingChange?: (sorting: SortState[]) => void

  /**
   * Permite ordenação múltipla com Shift+Click.
   * @default false
   */
  enableMultiSort?: boolean

  // ==================== Filtragem ====================

  /**
   * Estado atual dos filtros (controlado externamente).
   */
  filters?: FilterState[]

  /**
   * Callback chamado quando os filtros mudam.
   */
  onFiltersChange?: (filters: FilterState[]) => void

  /**
   * Modo de disparo do filtro.
   * - 'onChange': filtra enquanto digita (padrão)
   * - 'onEnter': filtra apenas ao pressionar Enter
   * @default 'onChange'
   */
  filterTrigger?: 'onChange' | 'onEnter'

  // ==================== Seleção ====================

  /**
   * Habilita checkboxes de seleção por linha.
   * @default false
   */
  enableSelection?: boolean

  /**
   * IDs das linhas selecionadas (controlado externamente).
   */
  selectedRows?: Set<string | number>

  /**
   * Callback chamado quando a seleção muda.
   */
  onSelectionChange?: (selectedRows: Set<string | number>) => void

  /**
   * Função para determinar se uma linha específica pode ser selecionada.
   */
  isRowSelectable?: (row: TData) => boolean

  // ==================== Estados de UI ====================

  /**
   * Exibe overlay de loading com spinner.
   * @default false
   */
  isLoading?: boolean

  /**
   * Mensagem exibida quando não há dados.
   * @default 'Nenhum resultado encontrado.'
   */
  emptyMessage?: string

  /**
   * Componente customizado para estado vazio.
   */
  emptyComponent?: ReactNode

  // ==================== Estilização ====================

  /**
   * Exibe linhas de grade verticais entre colunas.
   * @default false
   */
  showVerticalLines?: boolean

  /**
   * Exibe linhas de grade horizontais entre linhas.
   * @default true
   */
  showHorizontalLines?: boolean

  /**
   * Altura do container. Pode ser fixa ('400px') ou flexível ('100%', 'auto').
   * @default 'auto'
   */
  height?: string | number

  /**
   * Altura máxima do container.
   */
  maxHeight?: string | number

  /**
   * Classes CSS adicionais para o container principal.
   */
  className?: string

  /**
   * Callback chamado ao clicar em uma linha.
   */
  onRowClick?: (row: TData, rowIndex: number) => void

  /**
   * Habilita efeito de hover nas linhas.
   * @default true
   */
  enableRowHover?: boolean

  /**
   * Habilita listras alternadas nas linhas.
   * @default true
   */
  enableStripedRows?: boolean

  /**
   * Placeholder exibido quando o valor de uma célula é undefined, null ou string vazia.
   * Pode ser uma string (ex: '-', 'N/A') ou um componente React.
   * @default undefined (não exibe nada)
   */
  emptyValuePlaceholder?: EmptyValuePlaceholder

  // ==================== Reordenação de Colunas ====================

  /**
   * Habilita reordenação de colunas via drag & drop.
   * @default false
   */
  enableColumnReorder?: boolean

  /**
   * Ordem atual das colunas (array de IDs).
   * Se não fornecido, usa a ordem das colunas definidas.
   */
  columnOrder?: string[]

  /**
   * Callback chamado quando a ordem das colunas muda.
   * Recebe o novo array de IDs na ordem atual.
   */
  onColumnOrderChange?: (columnOrder: string[]) => void

  // ==================== Redimensionamento de Colunas ====================

  /**
   * Habilita redimensionamento de colunas arrastando a borda direita do cabeçalho.
   * @default false
   */
  enableColumnResize?: boolean
}

/**
 * Props internas do GridHeader
 */
export interface GridHeaderProps<TData> {
  columns: ColumnDef<TData>[]
  gridTemplateColumns: string
  sorting?: SortState[]
  onSortingChange?: (sorting: SortState[]) => void
  enableMultiSort?: boolean
  filters?: FilterState[]
  onFiltersChange?: (filters: FilterState[]) => void
  filterTrigger?: 'onChange' | 'onEnter'
  enableSelection?: boolean
  selectedRows?: Set<string | number>
  onSelectAll?: (checked: boolean) => void
  selectAllState: 'checked' | 'unchecked' | 'indeterminate'
  showVerticalLines?: boolean
  enableColumnReorder?: boolean
  onColumnReorder?: (fromIndex: number, toIndex: number) => void
  enableColumnResize?: boolean
  onColumnResize?: (columnId: string, width: number) => void
}

/**
 * Props internas do GridBody
 */
export interface GridBodyProps<TData> {
  columns: ColumnDef<TData>[]
  data: TData[]
  gridTemplateColumns: string
  getRowId: (row: TData) => string | number
  enableSelection?: boolean
  selectedRows?: Set<string | number>
  onRowSelect?: (rowId: string | number, checked: boolean) => void
  isRowSelectable?: (row: TData) => boolean
  showVerticalLines?: boolean
  showHorizontalLines?: boolean
  onRowClick?: (row: TData, rowIndex: number) => void
  enableRowHover?: boolean
  enableStripedRows?: boolean
  emptyValuePlaceholder?: EmptyValuePlaceholder
}

/**
 * Props internas do GridRow
 */
export interface GridRowProps<TData> {
  row: TData
  rowIndex: number
  columns: ColumnDef<TData>[]
  gridTemplateColumns: string
  rowId: string | number
  enableSelection?: boolean
  isSelected?: boolean
  onSelect?: (checked: boolean) => void
  isSelectable?: boolean
  showVerticalLines?: boolean
  showHorizontalLines?: boolean
  onClick?: () => void
  enableRowHover?: boolean
  isStriped?: boolean
  emptyValuePlaceholder?: EmptyValuePlaceholder
}
