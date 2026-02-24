
import { useHeader } from '@/hooks/mobile/use-header'
import { Logo } from '../logo'
import { Button } from '@/components/ui/button'
import { HistoryIcon, LogOutIcon } from 'lucide-react'

export function AppHeader() {
  const { pageDescription } = useHeader()

  return (
    <header className='flex justify-between items-center h-(--header-height) shrink-0 gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height) bg-primary px-4 py-2'>
      <div className='flex flex-col'>
        <Logo variant='light' className='w-40' />
        <span className='text-lg text-white uppercase'>{pageDescription}</span>
      </div>

      <div className='flex gap-2'>
        <Button className='size-10 hover:bg-yellow-500'>
          <HistoryIcon className='size-6'/>
        </Button>
        <Button className='size-10 hover:bg-yellow-500'>
          <LogOutIcon className='size-6'/>
        </Button>
      </div>
    </header>
  )
}
