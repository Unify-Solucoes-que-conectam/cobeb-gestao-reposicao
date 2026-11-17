export type PaginationData = {
  current_page: number
  last_page: number
  from: number | null
  to: number | null
  total: number
  per_page: number
}

export type ApiResponse<T = unknown> = {
  success: boolean
  message: string
  data: T
  pagination?: PaginationData
  debug_errors?: Record<string, string[]>
  error_code?: string
  /** true quando o dado veio do cache local (sem conexão com a API) */
  offline?: boolean
  /** true quando a ação foi salva na fila local e será enviada ao voltar a conexão */
  queued?: boolean
}
