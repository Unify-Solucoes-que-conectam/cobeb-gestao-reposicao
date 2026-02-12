import { Navigate, Outlet } from 'react-router-dom'

import Loader from '@/components/custom/loader'
import { useAuth } from '@/hooks/use-auth'
import { getHomeByRole } from '@/routes/utils'

/**
 * Guarda de rota para páginas de visitante (login, registro, etc).
 * - Se autenticado: redireciona para a home do role do usuário
 * - Se não autenticado: renderiza a rota
 */
export function GuestRoute() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (isAuthenticated && user) {
    return <Navigate to={getHomeByRole(user.role)} replace />
  }

  return <Outlet />
}
