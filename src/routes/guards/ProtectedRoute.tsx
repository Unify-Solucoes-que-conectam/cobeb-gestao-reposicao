import Loader from '@/components/custom/loader'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

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
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader />
      </div>
    )
  }

  if (!isAuthenticated) {

    if (location.pathname !== '/auth/login') {
      // Redireciona para login e mantém a rota original no estado para redirecionamento pós-login
      return <Navigate to="/auth/login" state={{ from: location }} replace />
    }
  }

  // Se roles específicos são requeridos, verifica se o usuário tem permissão
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redireciona para a home do role do usuário
    const redirectPath = user.role === 'monitoramento'
      ? '/admin/avarias'
      : '/client/home'
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}
