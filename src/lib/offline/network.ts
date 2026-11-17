import vanillaAxios, { type AxiosResponse } from 'axios'

/** Tempo máximo de espera por uma resposta antes de considerar a API inacessível. */
export const REQUEST_TIMEOUT = 10_000

/** Lançado quando a API respondeu como "fora do ar" (proxy/gateway sem upstream). */
export class UnreachableError extends Error {
  constructor() {
    super('API inacessível')
    this.name = 'UnreachableError'
  }
}

/**
 * O axios do projeto usa `validateStatus: () => true`, então 502/503/504 não viram exceção.
 * Aqui tratamos esses status como "sem conexão" para que o app caia no modo offline.
 */
export function assertReachable<T extends AxiosResponse>(response: T): T {
  if ([502, 503, 504].includes(response.status)) throw new UnreachableError()
  return response
}

/** true quando a falha é de rede/timeout (sem resposta do servidor). Cancelamentos NÃO contam. */
export function isUnreachable(error: unknown): boolean {
  if (error instanceof UnreachableError) return true
  if (vanillaAxios.isCancel(error)) return false
  return vanillaAxios.isAxiosError(error) && !error.response
}

export function isBrowserOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false
}
