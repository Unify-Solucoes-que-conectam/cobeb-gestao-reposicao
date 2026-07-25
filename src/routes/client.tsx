import type { RouteObject } from 'react-router-dom'

import ClientAvariasRegistradas from '@/pages/client/avarias-registradas'
import ClientHome from '@/pages/client/home'
import ClientRegistrarAvarias from '@/pages/client/registrar-avarias'
import ChangePasswordPage from '@/pages/auth/change-password'

export const clientRoutes: RouteObject[] = [
  {
    path: 'home',
    element: <ClientHome />,
  },
  {
    path: 'avarias-registradas',
    element: <ClientAvariasRegistradas />,
  },
  {
    path: 'registrar-avarias',
    element: <ClientRegistrarAvarias />,
  },
  {
    path: 'change-password',
    element: <ChangePasswordPage />,
  }
]
