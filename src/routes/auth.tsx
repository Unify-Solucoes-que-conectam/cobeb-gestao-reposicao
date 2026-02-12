import { type RouteObject } from 'react-router-dom'

import AuthPage from '@/pages/auth'

export const authRoutes: RouteObject[] = [
  {
    path: '/auth/login',
    element: <AuthPage />,
  },
  // Adicione outras rotas públicas aqui (registro, forgot-password, etc)
]
