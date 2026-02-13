import { CircleUserRoundIcon, EllipsisVerticalIcon, LogOutIcon } from 'lucide-react'
import { Skeleton } from '../ui/skeleton'

import cobeb_profile_light from '@/assets/cobeb-profile-light.png'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { formatCPF } from '@/utils/formatters'

export function SidebarUser() {
  const { isMobile } = useSidebar()
  const { user, signOut, loading } = useAuth()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar>
                <AvatarImage src={cobeb_profile_light} />
                <AvatarFallback>{user?.nome.charAt(0).concat(user?.nome.charAt(1) || '').toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                {loading ? (
                  <Skeleton className='p-2 mb-1 w-22' />
                ) : (
                  <span className='truncate font-medium'>{user?.nome.toUpperCase()}</span>
                )}
                {loading ? (
                  <Skeleton className='p-1' />
                ) : (
                  <span className='text-muted-foreground truncate text-xs'>{formatCPF(user?.cpf || '')}</span>
                )}
              </div>
              <EllipsisVerticalIcon className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar>
                  <AvatarImage src={cobeb_profile_light} />
                  <AvatarFallback>{user?.nome.charAt(0).concat(user?.nome.charAt(1) || '').toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  {loading ? (
                    <Skeleton className='p-2 mb-1 w-22' />
                  ) : (
                    <span className='truncate font-medium'>{user?.nome.toUpperCase()}</span>
                  )}
                  {loading ? (
                    <Skeleton className='p-1' />
                  ) : (
                    <span className='text-muted-foreground truncate text-xs'>{formatCPF(user?.cpf || '')}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className='gap-2'>
                <CircleUserRoundIcon size={18}/>
                Conta
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className='gap-2'>
              <LogOutIcon size={18}/>
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
