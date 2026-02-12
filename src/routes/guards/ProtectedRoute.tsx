import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import Loader from '@/components/custom/loader'

interface ProtectedRouteProps {
  allowedRoles?: Array<'monitoramento' | 'motorista'>
}

/**
 * Guarda de rota que verifica autenticação e roles permitidos.
 * - Se não autenticado: redireciona para /auth/login
 * - Se autenticado mas sem permissão de role: redireciona para a home do seu role
 * - Se autenticado e autorizado: renderiza a rota
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, loading, user } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader />
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />
  }

  // Se roles específicos são requeridos, verifica se o usuário tem permissão
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redireciona para a home do role do usuário
    const redirectPath = user.role === 'monitoramento'
      ? '/admin/dashboard'
      : '/cliente/home'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
