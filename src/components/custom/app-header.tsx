import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useHeader } from '@/hooks/use-header'
import HeaderNotifications from './header-notifications'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useNavigate } from 'react-router'

export function AppHeader() {
  const { pageBreadcrumbs } = useHeader()
  const navigate = useNavigate()

  return (
    <header className='flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)'>
      <div className='flex w-full items-center justify-between lg:px-6 px-4'>
        <div className='flex items-center gap-1 lg:gap-2 '>
          <SidebarTrigger className='-ml-1' />
          <Separator orientation='vertical' className='mx-2 data-[orientation=vertical]:h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              {pageBreadcrumbs.map((breadcrumb, index) => (
                <BreadcrumbItem key={index}>
                  <BreadcrumbLink className='cursor-pointer' onClick={() => navigate(breadcrumb.href)}>
                    <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                  </BreadcrumbLink>
                  {index < pageBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </BreadcrumbItem>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <HeaderNotifications />
      </div>
    </header>
  )
}
