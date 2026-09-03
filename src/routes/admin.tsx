import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias'
import AdminMapas from '@/pages/admin/gerenciar/mapas'
import AdminMotoristas from '@/pages/admin/gerenciar/motoristas'
import AdminUsuarios from '@/pages/admin/gerenciar/usuarios'
import AdminImportacoes from '@/pages/admin/importacoes'
import AdminWhatsApp from '@/pages/admin/gerenciar/whatsapp'
import { ProtectedRoute } from './guards'

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
    element: <ProtectedRoute allowedRoles={['administrador']} />,
    children: [
      { path: 'gerenciar/usuarios', element: <AdminUsuarios /> },
      { path: 'gerenciar/whatsapp', element: <AdminWhatsApp /> },
    ],
  },
]
