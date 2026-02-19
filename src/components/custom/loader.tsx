import { LoaderCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface LoaderProps {
  showMessage?: boolean
  message?: string
  className?: string
}

export default function Loader(props: LoaderProps) {
  return (
    <div className='w-full flex'>
      <div className={cn('flex flex-col items-center justify-center mx-auto', props.className)}>
        <LoaderCircleIcon className='animate-spin' />
        {props.showMessage && <p>{props.message || 'Carregando...'}</p>}
      </div>
    </div>
  )
}
