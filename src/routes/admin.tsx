import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias'
import AdminImportacoes from '@/pages/admin/importacoes'
import AdminMapas from '@/pages/admin/gerenciar/mapas'
import AdminMotoristas from '@/pages/admin/gerenciar/motoristas'
import AdminUsuarios from '@/pages/admin/gerenciar/usuarios'

export const adminRoutes: RouteObject[] = [
  {
    path: 'avarias',
    element: <AdminAvarias />,
  },
  {
    path: 'importacoes',
    element: <AdminImportacoes />,
  },
  {
    path: 'gerenciar/mapas',
    element: <AdminMapas />,
  },
  {
    path: 'gerenciar/motoristas',
    element: <AdminMotoristas />,
  },
  {
    path: 'gerenciar/usuarios',
    element: <AdminUsuarios />,
  },
]
