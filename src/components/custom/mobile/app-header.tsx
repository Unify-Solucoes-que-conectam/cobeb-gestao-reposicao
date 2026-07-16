import { Logo } from '../logo'
import { ArrowLeftIcon, LogOutIcon } from 'lucide-react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { useHeader } from '@/hooks/mobile/use-header'
import { useAuth } from '@/hooks/use-auth'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

export function AppHeader() {
  // =============== HOOKS =============
  const { pageTitle, pageDescription, showBackButton } = useHeader()
  const { signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 10px)' }}
      className='flex justify-between items-center shrink-0 gap-2 border-b bg-primary px-4 pb-2'
    >
      <div className='flex items-center gap-4'>
        {showBackButton && (
          <Button
            size='icon'
            className='rounded-lg shadow-accent-foreground'
            onClick={() => navigate('/client/home')}
          >
            <ArrowLeftIcon className='text-white size-6' />
          </Button>
        )}

        <div className='flex flex-col'>
          {!showBackButton && <Logo variant='light' className='w-40' />}

          {pageTitle && (
            <span className='text-md text-white uppercase font-semibold mt-1'>{pageTitle}</span>
          )}

          {pageDescription && (
            <span className='text-xs text-gray-400 uppercase'>{pageDescription}</span>
          )}
        </div>
      </div>

      <div className='flex gap-2'>
  <AlertDialog>
    
    {/* GATILHO: O botão original fica aqui dentro com o asChild */}
    <AlertDialogTrigger asChild>
      <Button className='size-10 rounded-lg shadow-accent-foreground hover:bg-red-500'>
        <LogOutIcon className='size-6' />
      </Button>
    </AlertDialogTrigger>
    
    <AlertDialogContent className="w-[90%] max-w-[380px] rounded-3xl p-6 bg-white gap-6">
      
      {/* TEXTOS CENTRALIZADOS */}
      <AlertDialogHeader className="flex flex-col items-center text-center space-y-2">
        <AlertDialogTitle className="text-lg leading-snug font-semibold text-slate-900">
          Você tem certeza que deseja sair?
        </AlertDialogTitle>
        <AlertDialogDescription className="text-xs font-medium text-slate-500">
          Ao continuar sua conta será desconectada do aplicativo.
        </AlertDialogDescription>
      </AlertDialogHeader>

      {/* RODAPÉ E BOTÕES: Flex-col para empilhar, Cancelar primeiro */}
      <AlertDialogFooter className="flex flex-col gap-3 sm:flex-col sm:space-x-0">
        
        <AlertDialogCancel className="w-full h-11 mt-0 rounded-xl border border-slate-200 font-semibold text-slate-800 bg-white hover:bg-slate-50 shadow-sm">
          Cancelar
        </AlertDialogCancel>
        
        {/* A Ação real de signOut fica aqui */}
        <AlertDialogAction 
          onClick={signOut} 
          className="w-full h-11 rounded-xl bg-red-500 hover:bg-red-700 text-white font-semibold shadow-sm"
        >
          Desconectar
        </AlertDialogAction>
        
      </AlertDialogFooter>

    </AlertDialogContent>
  </AlertDialog>
</div>
    </header>
  )
}
