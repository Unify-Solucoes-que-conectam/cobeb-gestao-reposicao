import AppLayout from '@/pages/layout'
import NotFound from '@/pages/NotFound'
import { createBrowserRouter } from 'react-router-dom'

import { adminRoutes } from './admin'
import { authRoutes } from './auth'
import { clientRoutes } from './client'
import { GuestRoute, ProtectedRoute, RoleRedirect } from './guards'
import MobileLayout from '@/pages/mobile-layout'

const router = createBrowserRouter([
  // Rota raiz - redireciona baseado no role
  {
    path: '/',
    element: <RoleRedirect />,
  },

  // Rotas públicas (login, registro, etc)
  {
    element: <GuestRoute />,
    children: authRoutes,
  },

  // Rotas de Admin (monitoramento)
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['monitoramento']} />,
    children: [
      {
        element: <AppLayout />,
        children: adminRoutes,
      },
    ],
  },

  // Rotas de Cliente (motorista)
  {
    path: '/cliente',
    element: <ProtectedRoute allowedRoles={['motorista']} />,
    children: [
      {
        element: <MobileLayout />,
        children: clientRoutes,
      },
    ],
  },

  // 404 - Not Found
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
