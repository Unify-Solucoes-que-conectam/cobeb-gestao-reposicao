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

// Configura a StatusBar nativa no Capacitor
if (Capacitor.isNativePlatform()) {
  StatusBar.setStyle({ style: Style.Dark }); // ícones brancos na barra de status
}

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <ThemeProvider defaultTheme='light' storageKey='theme'>
      <LogProvider>
        <RouterProvider router={router} />
      </LogProvider>

      <Toaster
        className='pointer-events-auto'
        position='bottom-right'
        visibleToasts={3}
        expand={false}
        richColors
        toastOptions={{
          classNames: {
            toast:
              '!bg-neutral-100 border !border-neutral-200 dark:!bg-neutral-800 dark:!border-neutral-700',
          },
        }}
      />
    </ThemeProvider>
  </AuthProvider>
)
