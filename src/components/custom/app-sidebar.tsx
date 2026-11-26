import * as React from 'react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'

import { SidebarMain } from './sidebar-main'
import { SidebarSecondary } from './sidebar-secondary'
import { SidebarUser } from './sidebar-user'
import { TenantSwitcher } from './tenant-switcher'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const data = {
    sidebarSecondary: [],
  }

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      {/* a logo fica no header da página; aqui o topo é a filial conectada */}
      <SidebarHeader>
        <TenantSwitcher />
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
