import type { RouteObject } from 'react-router-dom'

import ClientHome from '@/pages/client'

export const clientRoutes: RouteObject[] = [
  {
    path: 'home',
    element: <ClientHome />,
  },
  // Adicione outras rotas de cliente aqui
]
