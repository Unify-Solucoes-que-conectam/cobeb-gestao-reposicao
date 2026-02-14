import { useNavigate } from 'react-router'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar'
import { Menu } from '@/types/app'
import DynamicIcon from './dynamic-icon'

export function SidebarMain({
  items,
}: {
  items: Menu[]
}) {
  const navigate = useNavigate()

  const renderSubMenuItems = (menuItems: Menu[]) =>
    [...menuItems]
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => {
        const hasSubMenus = item.sub_menus && item.sub_menus.length > 0

        return (
          <SidebarMenuSubItem key={item.id ?? item.titulo}>
            <SidebarMenuSubButton asChild>
              <button
                type='button'
                onClick={() => item.rota && navigate(item.rota)}
              >
                {item.icone && <DynamicIcon iconName={item.icone} />}
                <span>{item.titulo}</span>
              </button>
            </SidebarMenuSubButton>

            {hasSubMenus && (
              <SidebarMenuSub>{renderSubMenuItems(item.sub_menus)}</SidebarMenuSub>
            )}
          </SidebarMenuSubItem>
        )
      })

  const renderMenuItems = (menuItems: Menu[]) =>
    [...menuItems]
      .sort((a, b) => a.ordem - b.ordem)
      .map((item) => {
        const hasSubMenus = item.sub_menus && item.sub_menus.length > 0

        return (
          <SidebarMenuItem key={item.id ?? item.titulo}>
            <SidebarMenuButton
              tooltip={item.titulo}
              onClick={() => item.rota && navigate(item.rota)}
            >
              {item.icone && <DynamicIcon iconName={item.icone} />}
              <span>{item.titulo}</span>
            </SidebarMenuButton>

            {hasSubMenus && (
              <SidebarMenuSub>{renderSubMenuItems(item.sub_menus)}</SidebarMenuSub>
            )}
          </SidebarMenuItem>
        )
      })

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menus</SidebarGroupLabel>
      <SidebarGroupContent className='flex flex-col gap-2'>
        <SidebarMenu>
          {renderMenuItems(items)}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}