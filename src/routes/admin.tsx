import type { RouteObject } from 'react-router-dom'

import AdminDashboard from '@/pages/admin/dashboard'

export const adminRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: <AdminDashboard />,
  },
  // Adicione outras rotas de admin aqui
]
