import packageJson from "../../../package.json";

import { EllipsisVerticalIcon, LogOutIcon, MoonIcon } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';

import cobeb_profile_light from '@/assets/cobeb-profile-light.png';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAuth } from '@/hooks/use-auth';

import { formatCPF } from '@/utils/formatters';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Theme, useTheme } from "@/hooks/use-theme";

export function SidebarUser() {
  const { isMobile } = useSidebar()
  const { user, signOut, loading } = useAuth()
  const { theme, setTheme } = useTheme();

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
              <DropdownMenuGroup>
                <DropdownMenuItem disabled>Versão atual: {packageJson.version}</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <DropdownMenuItem className='gap-2'>
                  <MoonIcon size={18} />
                  Tema
                </DropdownMenuItem>
              </DropdownMenuTrigger>

              <DropdownMenuContent side="right" className="w-56 ml-1 mb-12">
                <DropdownMenuLabel>Escolha o tema de sua preferência!</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as Theme)}>
                  <DropdownMenuRadioItem value="light">Claro</DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="dark">Escuro</DropdownMenuRadioItem>

                  <DropdownMenuRadioItem value="system">Automático</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className='gap-2'>
              <LogOutIcon size={18} />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
