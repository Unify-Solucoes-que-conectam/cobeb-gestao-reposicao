import type { Usuario } from '@/types/app'

type UserRole = Usuario['role']

/**
 * Retorna o caminho da home baseado no role do usuário.
 */
export function getHomeByRole(role?: UserRole): string {
  switch (role) {
    case 'monitoramento':
      return '/admin/avarias'
    case 'motorista':
      return '/cliente/home'
    default:
      return '/auth/login'
  }
}
