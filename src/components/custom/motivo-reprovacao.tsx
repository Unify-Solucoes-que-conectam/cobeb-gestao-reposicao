import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Textarea } from '../ui/textarea'
import { toast } from 'sonner'

interface MotivoReprovacaoProps {
  children: React.ReactNode
  loading: boolean
  handleConfirm: (motivo: string) => void
}

export default function MotivoReprovacao(props: MotivoReprovacaoProps) {

  // ======================= States ====================
  const [motivo, setMotivo] = useState('')

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild className='inline-flex'>
        {props.children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Motivo de reprovação</AlertDialogTitle>
          <AlertDialogDescription>Descreva o motivo da reprovação</AlertDialogDescription>
        </AlertDialogHeader>

        <div>
          <Label htmlFor='motivo-reprovacao'>Motivo: <span className='text-red-500'>*</span></Label>
          <Textarea id='motivo-reprovacao' className='resize-none h-auto min-h-0' onChange={(e) => setMotivo(e.target.value)}></Textarea>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancelar
          </AlertDialogCancel>
          <Button
            className='bg-destructive hover:bg-destructive/90'
            disabled={props.loading}
            onClick={() => motivo !== '' ? props.handleConfirm(motivo) : toast.error('O motivo de reprovação é obrigatório!')}
          >
            {props.loading && <Loader2Icon className='mr-2 h-4 w-4 animate-spin' />}
            Reprovar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}