import { Outlet, useNavigate } from 'react-router-dom'

import { AppHeader } from '@/components/custom/app-header'
import { AppSidebar } from '@/components/custom/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { HeaderProvider } from '@/providers/HeaderProvider'
import { useEffect } from 'react'

export default function AppLayout() {

  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o app está rodando dentro da janela do PWA instalado
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    if (isPWA) {
      // Se já estiver instalado e abrindo o PWA, manda direto para o login
      navigate('/auth/login');
    }
  }, [navigate]);

  // A proteção de rotas agora é feita pelo ProtectedRoute guard
  return (
    <HeaderProvider>
      <SidebarProvider
        style={
          {
            '--sidebar-width': 'calc(var(--spacing) * 72)',
            '--header-height': 'calc(var(--spacing) * 12)',
          } as React.CSSProperties
        }
      >
        <AppSidebar variant='inset' />
        <SidebarInset>
          <AppHeader />
          <div className='flex flex-1 flex-col p-4'>
            <div className='@container/main flex flex-1 flex-col gap-2 p-6'>
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </HeaderProvider>
  )
}
