import { Outlet, useNavigate } from 'react-router'

import { AppHeader } from '@/components/custom/mobile/app-header'
import { HeaderProvider } from '@/providers/mobile/HeaderProvider'
import { useEffect } from 'react';

export default function MobileLayout() {

  const navigate = useNavigate();

  useEffect(() => {
    // Verifica se o app está rodando dentro da janela do PWA instalado
    const isPWA = window.matchMedia('(display-mode: standalone)').matches;

    if (isPWA) {
      // Se já estiver instalado e abrindo o PWA, manda direto para o login
      navigate('/auth/login');
    }
  }, [navigate]);

  return (
    <HeaderProvider>
      <div className='fixed inset-0 flex flex-col overflow-hidden bg-slate-50'>
        <AppHeader />
        <main className='flex flex-1 flex-col min-h-0'>
          <div className='@container/main flex flex-1 flex-col min-h-0 w-full p-4'>
            <Outlet />
          </div>
        </main>
      </div>
    </HeaderProvider>
  )
}
