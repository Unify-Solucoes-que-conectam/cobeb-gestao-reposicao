import type { AxiosResponse } from 'axios'

import type { ApiResponse } from '@/types/api-response'

import { cacheGet, cacheSet } from './idb'
import { assertReachable, isUnreachable } from './network'

export const OFFLINE_NO_DATA_MESSAGE =
  'Sem conexão e sem dados salvos neste aparelho. Conecte-se à internet para carregar.'

interface Options<T> {
  /** Grava a resposta no cache quando bem-sucedida (padrão: true). Use false para consultas filtradas. */
  save?: boolean
  /** Ajusta o dado salvo antes de devolver (ex.: aplicar filtro de busca localmente). */
  transform?: (cached: T) => T
}

/**
 * Network-first com fallback para o cache local (IndexedDB).
 *  - Online: devolve a resposta da API e atualiza o cache.
 *  - Offline/timeout: devolve o último dado salvo, marcado com `offline: true`.
 *  - Erros reais da API (4xx/5xx) são devolvidos normalmente, sem cair no cache.
 */
export async function networkOrCache<T>(
  key: string,
  request: () => Promise<AxiosResponse<ApiResponse<T>>>,
  { save = true, transform }: Options<T> = {}
): Promise<ApiResponse<T>> {
  try {
    const response = assertReachable(await request())

    if (response.data?.success && save) {
      await cacheSet(key, response.data.data)
    }
    return response.data
  } catch (error) {
    if (!isUnreachable(error)) throw error

    const entry = await cacheGet<T>(key)
    if (!entry) {
      return { success: false, message: OFFLINE_NO_DATA_MESSAGE, data: null as T, offline: true }
    }

    return {
      success: true,
      message: '',
      data: transform ? transform(entry.value) : entry.value,
      offline: true,
    }
  }
}

export { cacheGet, cacheSet }
