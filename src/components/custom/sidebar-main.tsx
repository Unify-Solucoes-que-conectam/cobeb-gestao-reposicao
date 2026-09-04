import { ChevronRight, LoaderCircle } from 'lucide-react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import { Menu } from '@/types/app'

import DynamicIcon from './dynamic-icon'

export const SidebarMain = () => {
  const { open } = useSidebar()
  const { loading, menus } = useAuth()

  if (!menus) return

  const recursiveMenu = (menu: Menu, nested = false) => {
    if (menu.sub_menus && menu.sub_menus.length > 0) {
      return (
        <Collapsible key={menu.id} asChild className='group/collapsible'>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton openOnClick tooltip={menu.titulo}>
                {menu.icone && <DynamicIcon iconName={menu.icone} />}

                <div className='flex items-center justify-between gap-1 flex-1 min-w-0'>
                  <span
                    className='text-ellipsis whitespace-nowrap overflow-hidden min-w-0'
                    title={menu.titulo}
                  >
                    {menu.titulo}
                  </span>

                  {dayjs().diff(dayjs(menu.created_at), 'day') < 5 && (
                    <Badge className='text-[0.55rem] px-1 shrink-0'>Novo</Badge>
                  )}
                </div>

                <ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
              </SidebarMenuButton>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <SidebarMenuSub>
                {menu.sub_menus.map((submenu) => recursiveMenu(submenu, true))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      )
    }

    const content = (
      <Link to={menu.rota || '#'}>
        {menu.icone && <DynamicIcon iconName={menu.icone} />}

        <div className='flex items-center justify-between gap-1 flex-1 min-w-0'>
          <span
            className='text-ellipsis whitespace-nowrap overflow-hidden min-w-0'
            title={menu.titulo}
          >
            {menu.titulo}
          </span>

          {dayjs().diff(dayjs(menu.created_at), 'day') < 5 && (
            <Badge className='text-[0.55rem] px-1 shrink-0'>Novo</Badge>
          )}
        </div>
      </Link>
    )

    if (nested) {
      return (
        <SidebarMenuSubItem key={menu.id}>
          <SidebarMenuSubButton asChild>{content}</SidebarMenuSubButton>
        </SidebarMenuSubItem>
      )
    }

    return (
      <SidebarMenuItem key={menu.id}>
        <SidebarMenuButton asChild tooltip={menu.titulo}>
          {content}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  if (loading) {
    return (
      <div className='flex flex-col gap-3 items-center justify-center w-full h-full'>
        <LoaderCircle
          className={cn('animate-spin text-muted-foreground', open ? 'w-12 h-12 ' : 'w-6 h-6')}
        />
        {open && 'Carregando Menus...'}
      </div>
    )
  }

  const managementRoot = menus.find((menu) => menu.titulo === 'Gerenciar')
  const operationalMenus = menus.filter((menu) => menu.id !== managementRoot?.id)
  const administrativeTitles = new Set(['Usuários', 'WhatsApp'])
  const managementMenus =
    managementRoot?.sub_menus.filter((menu) => !administrativeTitles.has(menu.titulo)) ?? []
  const administrativeMenus =
    managementRoot?.sub_menus.filter((menu) => administrativeTitles.has(menu.titulo)) ?? []

  const sections = [
    { title: 'Operacional', menus: operationalMenus },
    { title: 'Gerenciar', menus: managementMenus },
    { title: 'Administrativo', menus: administrativeMenus },
  ].filter((section) => section.menus.length > 0)

  return sections.map((section) => (
    <SidebarGroup key={section.title}>
      <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
      <SidebarMenu>{section.menus.map((menu) => recursiveMenu(menu))}</SidebarMenu>
    </SidebarGroup>
  ))
}
