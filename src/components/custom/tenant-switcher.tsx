import { BuildingIcon, CheckIcon, ChevronsUpDownIcon, GlobeIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import type { Tenant } from '@/types/app'

const TenantIcon = ({ tenant }: { tenant: Tenant | null }) =>
  tenant?.geral ? <GlobeIcon className='size-4' /> : <BuildingIcon className='size-4' />

/**
 * Seleção da filial (tenant) em que o usuário está conectado.
 * Fora do "Geral", importações recebem automaticamente a filial selecionada.
 */
export function TenantSwitcher() {
  const { tenants, tenant, setTenant } = useAuth()
  const { isMobile } = useSidebar()

  if (tenants.length === 0) return null

  const unico = tenants.length === 1

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={unico}>
            <SidebarMenuButton
              size='lg'
              tooltip='Filial conectada'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground'>
                <TenantIcon tenant={tenant} />
              </div>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate text-xs text-muted/50 dark:text-muted-foreground'>Filial conectada</span>
                <span className='truncate font-semibold'>{tenant?.nome ?? 'Selecione'}</span>
              </div>
              {!unico && <ChevronsUpDownIcon className='ml-auto size-4' />}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56'
            side={isMobile ? 'bottom' : 'right'}
            align='start'
          >
            <DropdownMenuLabel className='text-xs text-muted-foreground'>Conectar em</DropdownMenuLabel>
            {tenants.map((t, index) => (
              <div key={t.id}>
                {/* separa o "Geral" das filiais */}
                {index > 0 && tenants[index - 1].geral && <DropdownMenuSeparator />}
                <DropdownMenuItem onClick={() => setTenant(t.id)} className='gap-2'>
                  <TenantIcon tenant={t} />
                  <span className='flex-1 truncate'>{t.nome}</span>
                  {t.codigo && <span className='text-xs text-muted-foreground'>{t.codigo}</span>}
                  {t.id === tenant?.id && <CheckIcon className='size-4' />}
                </DropdownMenuItem>
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
