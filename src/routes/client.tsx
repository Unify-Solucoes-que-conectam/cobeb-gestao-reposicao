import type { RouteObject } from 'react-router-dom'

import ClientHome from '@/pages/client/home'
import ClientRegistrarAvarias from '@/pages/client/registrar-avarias'
import ClientRegistrarAvariasEtapa001 from '@/pages/client/registrar-avarias/etapa-001'

export const clientRoutes: RouteObject[] = [
  {
    path: 'home',
    element: <ClientHome />,
  },
  {
    path: 'registrar-avarias',
    element: <ClientRegistrarAvarias />,
  },
  {
    path: 'registrar-avarias/etapa-001',
    element: <ClientRegistrarAvariasEtapa001 />
  },
]
