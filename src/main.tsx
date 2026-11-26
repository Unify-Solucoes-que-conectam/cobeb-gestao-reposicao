import { createRoot } from 'react-dom/client'

import { RouterProvider } from 'react-router-dom'

import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Toaster } from './components/ui/sonner'
import { LogProvider } from './hooks/mobile/useLogger'
import './index.css'
import { AuthProvider } from './providers/AuthProvider'
import ThemeProvider from './providers/ThemeProvider'
import router from './routes'
import { startOfflineSync } from './lib/offline/outbox'
import { startPwaUpdater } from './lib/pwa-update'

// Reenvia, quando a conexão voltar, o que o motorista registrou offline
startOfflineSync()

// Registra o service worker e verifica periodicamente se há uma versão nova publicada
startPwaUpdater()

// Configura a StatusBar nativa no Capacitor
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }); // ícones brancos na barra de status
}

// valida se está usando mobile ou web
const isMobile = Capacitor.isNativePlatform() || window.innerWidth <= 768;

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider defaultTheme='light' storageKey='theme'>
      <LogProvider>
        <RouterProvider router={router} />
      </LogProvider>

      <Toaster
        className='pointer-events-auto'
        position={isMobile ? 'top-center' : 'bottom-right'}
        visibleToasts={3}
        expand={false}
        richColors
        toastOptions={{
          classNames: {
            toast:
              `${isMobile ? '!bg-primary' : '!bg-neutral-100'} border ${isMobile ? '!border-primary' : '!border-neutral-200'} dark:!bg-neutral-800 dark:!border-neutral-700 mt-14`,
          },
        }}
      />
    </ThemeProvider>
  </AuthProvider>
)
