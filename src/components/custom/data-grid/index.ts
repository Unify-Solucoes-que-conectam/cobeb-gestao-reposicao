/**
 * DataGrid - Componente de tabela baseado em divs
 *
 * Um componente de tabela acessível e reutilizável construído inteiramente
 * com divs, utilizando CSS Grid para layout e ARIA roles para acessibilidade.
 *
 * ## Características
 *
 * - **Sem tags de tabela HTML**: Construído apenas com divs
 * - **Acessível**: Implementa ARIA roles (table, rowgroup, row, columnheader, cell)
 * - **CSS Grid**: Layout flexível com controle preciso de larguras
 * - **Scroll sincronizado**: Header e body se movem juntos horizontalmente
 * - **Header sticky**: Cabeçalho fixo durante scroll vertical
 * - **Ordenação**: Simples ou múltipla (Shift+Click)
 * - **Filtragem**: Input padrão ou componente customizado
 * - **Seleção**: Checkboxes por linha com "selecionar todos"
 * - **Estados de UI**: Loading overlay e estado vazio
 * - **Estilização**: Linhas de grade, hover, listras alternadas
 *
 * ## Uso básico
 *
 * ```tsx
 * import { DataGrid, type ColumnDef } from '@/components/custom/data-grid'
 *
 * interface User {
 *   id: number
 *   name: string
 *   email: string
 * }
 *
 * const columns: ColumnDef<User>[] = [
 *   { id: 'name', header: 'Nome', sortable: true },
 *   { id: 'email', header: 'E-mail', filterable: true },
 * ]
 *
 * function UsersTable() {
 *   const [users, setUsers] = useState<User[]>([])
 *
 *   return (
 *     <DataGrid
 *       columns={columns}
 *       data={users}
 *       getRowId={(row) => row.id}
 *     />
 *   )
 * }
 * ```
 *
 * @module DataGrid
 */

export { DataGrid } from './DataGrid'
export type {
  DataGridProps,
  ColumnDef,
  SortState,
  SortDirection,
  FilterState,
  Alignment,
  EmptyValuePlaceholder,
} from './types'
