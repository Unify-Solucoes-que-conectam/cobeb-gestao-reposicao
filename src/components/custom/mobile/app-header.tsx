
import { Button } from '@/components/ui/button'
import { useHeader } from '@/hooks/mobile/use-header'
import { useAuth } from '@/hooks/use-auth'
import { HistoryIcon, LogOutIcon } from 'lucide-react'
import { Logo } from '../logo'

export function AppHeader() {
  const { pageDescription } = useHeader()
  const { signOut } = useAuth();

  return (
    <header
      style={{ paddingTop: 'calc(env(safe-area-inset-top) + 10px)' }}
      className='flex justify-between items-center shrink-0 gap-2 border-b bg-primary px-4 pb-2'
    >
      <div className='flex flex-col'>
        <Logo variant='light' className='w-40' />
        <span className='text-lg text-white uppercase'>{pageDescription}</span>
      </div>

      <div className='flex gap-2'>
        <Button className='size-10 hover:bg-yellow-500'>
          <HistoryIcon className='size-6' />
        </Button>
        <Button className='size-10 hover:bg-yellow-500' onClick={signOut}>
          <LogOutIcon className='size-6' />
        </Button>
      </div>
    </header>
  )
}
