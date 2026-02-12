import * as React from 'react'

import { LayoutDashboardIcon, SettingsIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Skeleton } from '../ui/skeleton'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

import { Logo } from './logo'
import { SidebarSecondary } from './sidebar-secondary'
import { SidebarUser } from './sidebar-user'
import { SidebarMain } from './sidebar-main'

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
  sidebarSecondary: [
    {
      title: 'Configurações',
      url: '/admin/settings',
      icon: SettingsIcon,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { loading } = useAuth()

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className='data-[slot=sidebar-menu-button]:p-1.5!'>
              <Link to='/admin/dashboard'>
                <Logo />
                {loading ? (
                  <Skeleton className='w-full p-2' />
                ) : (
                  <span className='text-base font-semibold'>Monitoramento</span>
                )}
              </Link>
            </SidebarMenuButton>
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
