import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias'
import AdminImportacoes from '@/pages/admin/importacoes'

export const adminRoutes: RouteObject[] = [
  {
    path: 'avarias',
    element: <AdminAvarias />,
  },
  {
    path: 'importacoes',
    element: <AdminImportacoes />,
  },
]
