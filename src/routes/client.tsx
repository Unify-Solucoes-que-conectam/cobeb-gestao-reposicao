import type { RouteObject } from 'react-router-dom'

import ClientHome from '@/pages/client/home'
import ClientRegistrarAvarias from '@/pages/client/registrar-avarias'

export const clientRoutes: RouteObject[] = [
  {
    path: 'home',
    element: <ClientHome />,
  },
  {
    path: 'registrar-avarias',
    element: <ClientRegistrarAvarias />,
  },
]
