import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import type { ApiResponse } from '@/types/api-response'

export type PaginatedParams<F> = F & { search?: string; page: number; per_page: number }

/**
 * Consulta paginada de listagens.
 *
 * - O texto digitado (`busca`) só é aplicado ao clicar na lupa ou apertar Enter (`pesquisar`).
 * - Filtros de seleção (`setFilter`) aplicam na hora e voltam para a página 1.
 */
export function usePaginatedQuery<T, F extends Record<string, string>>(
  fetcher: (params: PaginatedParams<F>, signal: AbortSignal) => Promise<ApiResponse<T[]>>,
  initialFilters: F,
  { pageSize = 20, errorMessage = 'Erro ao carregar os dados' }: { pageSize?: number; errorMessage?: string } = {}
) {
  const [busca, setBusca] = useState('')
  const [termo, setTermo] = useState('')
  const [filters, setFilters] = useState<F>(initialFilters)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(pageSize)
  const [reloadKey, setReloadKey] = useState(0)

  const [items, setItems] = useState<T[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // mantém o fetcher mais recente sem refazer a consulta a cada renderização
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)

    fetcherRef.current({ ...filters, search: termo || undefined, page, per_page: perPage }, controller.signal)
      .then((response) => {
        if (controller.signal.aborted) return
        if (response.success) {
          setItems(response.data)
          setTotal(response.pagination?.total ?? response.data.length)
        } else {
          toast.error(response.message || errorMessage)
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) toast.error(errorMessage)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [termo, filters, page, perPage, reloadKey])

  /** Aplica o texto digitado (lupa / Enter) e volta para a página 1. */
  const pesquisar = useCallback(() => {
    setTermo(busca.trim())
    setPage(1)
    setReloadKey((key) => key + 1)
  }, [busca])

  const setFilter = useCallback(<K extends keyof F>(key: K, value: F[K]) => {
    setFilters((current) => ({ ...current, [key]: value }))
    setPage(1)
  }, [])

  /** Refaz a consulta atual (ex.: após cadastrar ou excluir). */
  const recarregar = useCallback(() => setReloadKey((key) => key + 1), [])

  return {
    items, total, loading,
    busca, setBusca, pesquisar,
    filters, setFilter,
    page, setPage,
    perPage, setPerPage: (size: number) => { setPerPage(size); setPage(1) },
    recarregar,
  }
}
