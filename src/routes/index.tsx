import AppLayout from '@/pages/layout'
import NotFound from '@/pages/NotFound'
import { createBrowserRouter } from 'react-router-dom'

import MobileLayout from '@/pages/mobile-layout'
import PWAInstall from '@/pages/pwa-install'
import PWAInstallGuide from '@/pages/pwa-install/guide'
import { adminRoutes } from './admin'
import { authRoutes } from './auth'
import { clientRoutes } from './client'
import { GuestRoute, ProtectedRoute, RoleRedirect } from './guards'

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
    element: <ProtectedRoute allowedRoles={['administrador', 'monitoramento']} />,
    children: [
      {
        element: <AppLayout />,
        children: adminRoutes,
      },
    ],
  },

  // Rotas de Cliente (motorista)
  {
    path: '/client',
    element: <ProtectedRoute allowedRoles={['motorista']} />,
    children: [
      {
        element: <MobileLayout />,
        children: clientRoutes,
      },
    ],
  },

  // Rota para instalar o app no celular (PWA)
  {
    path: '/install',
    children: [
      {
        path: '',
        element: <PWAInstall />,
      },
      {
        path: 'guide',
        element: <PWAInstallGuide />
      }
    ]
  },

  // 404 - Not Found
  {
    path: '*',
    element: <NotFound />,
  },
])

export default router
