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
}
