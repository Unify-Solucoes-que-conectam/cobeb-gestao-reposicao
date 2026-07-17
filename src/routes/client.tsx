import type { RouteObject } from 'react-router-dom'

import ClientHome from '@/pages/client/home'
import ClientAvariasRegistradas from '@/pages/client/avarias-registradas'

export const clientRoutes: RouteObject[] = [
  {
    path: 'home',
    element: <ClientHome />,
  },
  {
    path: 'avarias-registradas',
    element: <ClientAvariasRegistradas />,
  },
]
