import type { User } from '@/types/consults'

type UserRole = User['role']

/**
 * Retorna o caminho da home baseado no role do usuário.
 */
export function getHomeByRole(role?: UserRole): string {
  switch (role) {
    case 'monitoramento':
      return '/admin/dashboard'
    case 'motorista':
      return '/cliente/home'
    default:
      return '/auth/login'
  }
}
