import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useHeader } from '@/hooks/use-header'
import React from 'react'
import { Link } from 'react-router-dom'
import HeaderNotifications from './header-notifications'
import { Logo } from './logo'

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
        <div className='flex min-w-0 items-center gap-1 lg:gap-2 '>
          <SidebarTrigger className='-ml-1' />
          <HeaderNotifications />
          <Separator orientation='vertical' className='mx-2 data-[orientation=vertical]:h-4' />
          <Breadcrumb>
            <BreadcrumbList>
              {pageBreadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  <BreadcrumbItem>
                    {
                      index < pageBreadcrumbs.length - 1 ? (
                        <BreadcrumbLink className='cursor-pointer' onClick={() => navigate(breadcrumb.href)}>
                          {breadcrumb.title}
                        </BreadcrumbLink>
                      ) : (
                        <BreadcrumbPage>{breadcrumb.title}</BreadcrumbPage>
                      )
                    }
                  </BreadcrumbItem>
                  {index < pageBreadcrumbs.length - 1 && (
                    <BreadcrumbSeparator />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <Link to='/admin/avarias' className='ml-4 flex h-7 shrink-0 items-center' aria-label='Página inicial'>
          <Logo className='w-28' />
        </Link>
      </div>
    </header>
  )
}
