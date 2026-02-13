import * as React from 'react'

import { LayoutDashboardIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '../ui/skeleton'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

import { Logo } from './logo'
import { SidebarMain } from './sidebar-main'
import { SidebarSecondary } from './sidebar-secondary'
import { SidebarUser } from './sidebar-user'

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  sidebarPrimary: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboardIcon,
    },
  ],
  sidebarSecondary: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { loading } = useAuth()

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to='/admin/dashboard' className='flex flex-col gap-3'>
              <Logo className='w-40' variant='light' />
              {loading ? (
                <Skeleton className='w-full p-2' />
              ) : (
                <p className='text-base font-semibold'>Monitoramento</p>
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain items={data.sidebarPrimary} />
        <SidebarSecondary items={data.sidebarSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}
