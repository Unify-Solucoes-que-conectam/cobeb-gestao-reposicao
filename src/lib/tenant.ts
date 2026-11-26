import type { Tenant } from '@/types/app'

const STORAGE_KEY = 'tenant'

/** Id do tenant selecionado ('geral' ou id da filial). */
export function getTenantId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

export function setTenantId(id: string | null) {
  try {
    if (id) localStorage.setItem(STORAGE_KEY, id)
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // armazenamento indisponível: a API usa o tenant padrão do usuário
  }
}

/** Garante que o tenant salvo ainda está entre os liberados; senão usa o primeiro. */
export function resolveTenant(tenants: Tenant[]): Tenant | null {
  const saved = getTenantId()
  const tenant = tenants.find((t) => t.id === saved) ?? tenants[0] ?? null
  setTenantId(tenant?.id ?? null)
  return tenant
}
