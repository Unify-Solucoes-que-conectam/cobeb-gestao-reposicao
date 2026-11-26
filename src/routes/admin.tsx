import type { RouteObject } from 'react-router-dom'

import AdminAvarias from '@/pages/admin/avarias'
import AdminMapas from '@/pages/admin/gerenciar/mapas'
import AdminMotoristas from '@/pages/admin/gerenciar/motoristas'
import AdminUsuarios from '@/pages/admin/gerenciar/usuarios'
import AdminImportacoes from '@/pages/admin/importacoes'
import AdminWhatsApp from '@/pages/admin/gerenciar/whatsapp'
import AdminVendasTrocas from '@/pages/admin/vendas-trocas'
import AdminPermissoes from '@/pages/admin/gerenciar/permissoes'
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
    path: 'vendas-trocas',
    element: <AdminVendasTrocas />,
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
    element: <ProtectedRoute permission='usuarios.gerenciar' />,
    children: [{ path: 'gerenciar/usuarios', element: <AdminUsuarios /> }],
  },
  {
    element: <ProtectedRoute permission='whatsapp.gerenciar' />,
    children: [{ path: 'gerenciar/whatsapp', element: <AdminWhatsApp /> }],
  },
  {
    element: <ProtectedRoute permission='permissoes.gerenciar' />,
    children: [{ path: 'gerenciar/permissoes', element: <AdminPermissoes /> }],
  },
]
