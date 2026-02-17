import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias/avarias'
import AdminMapas from '@/pages/admin/gerenciar/mapas/mapas'
import AdminMotoristas from '@/pages/admin/gerenciar/motoristas/motoristas'
import AdminUsuarios from '@/pages/admin/gerenciar/usuarios/usuarios'
import AdminImportacoes from '@/pages/admin/importacoes/importacoes'

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
