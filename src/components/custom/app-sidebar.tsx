import * as React from 'react'

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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const { loading } = useAuth()

  const data = {
    sidebarSecondary: [],
  }

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link to='/admin/avarias' className='flex flex-col gap-3'>
              <Logo className='w-40' variant='light' />
              {loading ? (
                <Skeleton className='w-full p-2' />
              ) : (
                <p className='text-base font-semibold'>Gestão de Reposição</p>
              )}
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMain />
        <SidebarSecondary items={data.sidebarSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  )
}
