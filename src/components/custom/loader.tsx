import { LoaderCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoaderProps {
  showMessage?: boolean
  message?: string
  className?: string
}

export default function Loader(props: LoaderProps) {
  return (
    <div className={cn('w-full flex', props.className)}>
      <div className='flex flex-col items-center justify-center mx-auto'>
        <LoaderCircleIcon className='animate-spin' />
        {props.showMessage && <p>{props.message || 'Carregando...'}</p>}
      </div>
    </div>
  )
}
