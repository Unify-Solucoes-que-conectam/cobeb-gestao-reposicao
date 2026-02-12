import { Navigate } from 'react-router-dom'

import Loader from '@/components/custom/loader'
import { useAuth } from '@/hooks/use-auth'
import { getHomeByRole } from '@/routes/utils'

/**
 * Componente que redireciona o usuário para a home apropriada baseada no seu role.
 * Usado nas rotas raiz (/) para direcionar o usuário após autenticação.
 */
export function RoleRedirect() {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />
  }

  return <Navigate to={getHomeByRole(user?.role)} replace />
}
