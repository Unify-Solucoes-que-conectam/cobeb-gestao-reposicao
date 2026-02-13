import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias'

export const adminRoutes: RouteObject[] = [
  {
    path: 'avarias',
    element: <AdminAvarias />,
  },
  // Adicione outras rotas de admin aqui
]
