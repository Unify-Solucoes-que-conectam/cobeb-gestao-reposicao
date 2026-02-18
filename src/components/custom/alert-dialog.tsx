import { useState } from 'react'

import { Loader2Icon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface AlertProps {
  title: string
  description: string
  cancelButton?: {
    text?: string
    onClick?: () => void
  }
  confirmButton?: {
    text?: string
    onClick?: () => void
  }
  children: React.ReactNode
  loading?: boolean
}

export default function Alert(props: AlertProps) {
  const [open, setOpen] = useState(false)

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild className='inline-flex'>
        {props.children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{props.title}</AlertDialogTitle>
          <AlertDialogDescription>{props.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={props.cancelButton?.onClick}>
            {props.cancelButton?.text ?? 'Não'}
          </AlertDialogCancel>
          <AlertDialogAction
            className='bg-destructive hover:bg-destructive/90'
            disabled={props.loading}
            onClick={props.confirmButton?.onClick}
          >
            {props.loading && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
            {props.confirmButton?.text ?? 'Confirmar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
