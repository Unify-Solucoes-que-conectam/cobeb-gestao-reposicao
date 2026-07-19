import { Outlet } from 'react-router';

import { AppHeader } from '@/components/custom/mobile/app-header';
import { HeaderProvider } from '@/providers/mobile/HeaderProvider';

export default function MobileLayout() {

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
