import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'

import { Checkbox } from '../ui/checkbox'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { ClockIcon, DownloadIcon, FileIcon, MailIcon, UploadIcon, XIcon } from 'lucide-react'

export type ImportMode = 'sync' | 'async'
export type ErrorAction = 'ignore' | 'cancel'
export type DuplicateAction = 'ignore' | 'update'

export interface FileImportProps {
  /** Controla se o dialog está aberto (controlado externamente) */
  open?: boolean
  /** Elemento trigger (botão) para abrir o dialog */
  children: React.ReactNode
  /** Tipos de arquivo aceitos (extensões sem o ponto) */
  acceptedFiles?: string[]
  /** Se permite múltiplos arquivos */
  multiple?: boolean
  /** Modo de importação: síncrono ou assíncrono */
  mode?: ImportMode
  /** Se deve exibir opção de ação ao encontrar erro */
  showErrorAction?: boolean
  /** Se deve exibir opção de ação ao encontrar duplicatas */
  showDuplicateAction?: boolean
  /** Se deve exibir opção de notificação por email (apenas para modo async) */
  showEmailNotification?: boolean
  /** Função para baixar modelo de importação */
  onDownloadModel?: () => Promise<void> | void
  /** Função chamada ao confirmar importação */
  onSave?: (
    files: File[],
    options: ImportOptions,
    setLoading: (loading: boolean) => void
  ) => Promise<void> | void
  /** Função chamada ao cancelar */
  onCancel?: () => Promise<void> | void
  /** Callback para controle do estado do dialog */
  onOpenChange?: (open: boolean) => void
}

export interface ImportOptions {
  /** Ação ao encontrar erro */
  errorAction: ErrorAction
  /** Ação ao encontrar duplicatas */
  duplicateAction: DuplicateAction
  /** Se deve enviar email quando terminar (apenas async) */
  emailNotification: boolean
}

export function DataImporter({
  open,
  children,
  acceptedFiles = [],
  multiple = false,
  mode = 'sync',
  showErrorAction = false,
  showDuplicateAction = false,
  showEmailNotification = false,
  onDownloadModel,
  onSave,
  onCancel,
  onOpenChange,
}: FileImportProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  // Controle do estado do dialog
  const isOpen = open !== undefined ? open : internalOpen
  const setIsOpen = onOpenChange || setInternalOpen

  // Estados do componente
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [errorAction, setErrorAction] = useState<ErrorAction>('ignore')
  const [duplicateAction, setDuplicateAction] = useState<DuplicateAction>('ignore')
  const [emailNotification, setEmailNotification] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingDownload, setLoadingDownload] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handlers de drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFilesSelected(files)
    }
  }

  const handleDownloadModel = async () => {
    setLoadingDownload(true)

    try {
      await onDownloadModel?.()
    } finally {
      setLoadingDownload(false)
    }
  }

  // Handler de seleção de arquivos
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFilesSelected(Array.from(files))
    }
  }

  const handleFilesSelected = (files: File[]) => {
    // Filtra apenas arquivos com extensões aceitas
    const validFiles = files.filter((file) => {
      const extension = file.name.split('.').pop()?.toLowerCase()
      return extension && acceptedFiles.includes(extension)
    })

    if (multiple) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
    } else {
      setSelectedFiles(validFiles.slice(0, 1))
    }
  }

  // Remove arquivo específico ou todos
  const handleRemoveFile = (indexToRemove?: number) => {
    if (indexToRemove !== undefined) {
      setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove))
    } else {
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  // Manipula o clique do botão de importar
  const handleImport = async () => {
    if (onSave && selectedFiles.length > 0) {
      const options: ImportOptions = {
        errorAction,
        duplicateAction,
        emailNotification: mode === 'async' ? emailNotification : false,
      }

      const result = onSave(selectedFiles, options, setLoading)

      if (result instanceof Promise) {
        await result
      }
    }

    handleClose()
  }

  // Manipula o cancelamento
  const handleCancel = async () => {
    if (onCancel) {
      const result = onCancel()

      if (result instanceof Promise) {
        await result
      }
    }

    handleClose()
  }

  // Fecha o dialog e reseta o estado
  const handleClose = () => {
    setIsOpen(false)
    setSelectedFiles([])
    setErrorAction('ignore')
    setDuplicateAction('ignore')
    setEmailNotification(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Utilitários
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getModeIcon = () => {
    return mode === 'async' ? (
      <ClockIcon className='w-4 h-4' />
    ) : (
      <UploadIcon className='w-4 h-4' />
    )
  }

  const getModeDescription = () => {
    if (mode === 'async') {
      return 'A importação será processada em segundo plano e você receberá uma notificação quando concluída.'
    }
    return 'A importação será processada imediatamente.'
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {getModeIcon()}
            Importar Arquivo{multiple ? 's' : ''}
            {mode === 'async' && (
              <span className='text-sm font-normal text-muted-foreground'></span>
            )}
          </DialogTitle>
          <DialogDescription>
            {getModeDescription()}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col space-y-4'>
          {/* Botão de baixar modelo */}
          {onDownloadModel && (
            <Button
              variant='outline'
              onClick={handleDownloadModel}
              loading={loadingDownload}
              disabled={loadingDownload}
              className='w-full'
            >
              {!loadingDownload && <DownloadIcon className='w-4 h-4 mr-2' />}
              Baixar modelo de importação
            </Button>
          )}

          {/* Área de upload */}
          <div className='flex-1 overflow-hidden'>
            <div
              className={cn(
                'relative border-2 border-dashed rounded-lg p-2 transition-colors min-h-50 flex flex-col',
                isDragOver
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {/* Input de arquivo */}
              <input
                ref={fileInputRef}
                type='file'
                multiple={multiple}
                className={cn(
                  'absolute cursor-pointer',
                  selectedFiles.length === 0
                    ? 'inset-0 w-full h-full opacity-0'
                    : 'inset-x-0 bottom-0 h-8 opacity-0'
                )}
                onChange={handleFileSelect}
                accept={acceptedFiles.map((file) => `.${file}`).join(',')}
              />

              {selectedFiles.length > 0 ? (
                <div className='space-y-3 flex-1 overflow-hidden flex flex-col'>
                  <ScrollArea className='flex-1'>
                    <div className='space-y-2 max-h-50'>
                      {selectedFiles.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className='flex items-center justify-between p-3 bg-muted/50 rounded-lg'
                        >
                          <div className='flex items-center space-x-3 min-w-0 flex-1'>
                            <FileIcon className='w-6 h-6 text-blue-500 shrink-0' />
                            <div className='min-w-0 flex-1'>
                              <p className='text-sm font-medium truncate' title={file.name}>
                                {file.name}
                              </p>
                              <p className='text-xs text-muted-foreground'>
                                {formatFileSize(file.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleRemoveFile(index)
                            }}
                            className='text-muted-foreground hover:text-destructive shrink-0 ml-2 relative z-10'
                            type='button'
                          >
                            <XIcon className='w-4 h-4' />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  {multiple && (
                    <div className='text-center text-xs text-muted-foreground'>
                      Clique aqui para selecionar mais arquivos
                    </div>
                  )}
                </div>
              ) : (
                <div className='text-center flex-1 flex flex-col justify-center'>
                  <UploadIcon
                    className='mx-auto h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground'
                  />
                  <div className='mt-2 sm:mt-4'>
                    <p className='text-xs sm:text-sm font-medium'>
                      Arraste e solte seus arquivos aqui
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>ou clique para selecionar</p>
                  </div>
                  <p className='text-xs text-muted-foreground mt-4'>
                    Arquivos aceitos: {acceptedFiles.map((ext) => `.${ext}`).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Opções adicionais */}
          {(showErrorAction ||
            (showEmailNotification && mode === 'async') ||
            showDuplicateAction) && (
              <div className='space-y-3'>
                {showErrorAction && <Separator />}

                {/* Ação ao encontrar erro */}
                {showErrorAction && (
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>Ação ao encontrar erro:</Label>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          id='ignore-error'
                          name='errorAction'
                          checked={errorAction === 'ignore'}
                          onChange={() => setErrorAction('ignore')}
                          className='w-4 h-4'
                        />
                        <Label htmlFor='ignore-error' className='text-sm'>
                          Ignorar e continuar
                        </Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          id='cancel'
                          name='errorAction'
                          checked={errorAction === 'cancel'}
                          onChange={() => setErrorAction('cancel')}
                          className='w-4 h-4'
                        />
                        <Label htmlFor='cancel' className='text-sm'>
                          Cancelar importação
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {showDuplicateAction && <Separator />}

                {/* Ação ao encontrar uma duplicata nos registros */}
                {showDuplicateAction && (
                  <div className='space-y-2'>
                    <Label className='text-sm font-medium'>
                      Ação ao encontrar uma duplicata nos registros:
                    </Label>
                    <div className='flex items-center space-x-4'>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          id='ignore-duplicate'
                          name='duplicateAction'
                          checked={duplicateAction === 'ignore'}
                          onChange={() => setDuplicateAction('ignore')}
                          className='w-4 h-4'
                        />
                        <Label htmlFor='ignore-duplicate' className='text-sm'>
                          Ignorar e continuar
                        </Label>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <input
                          type='radio'
                          id='update'
                          name='duplicateAction'
                          checked={duplicateAction === 'update'}
                          onChange={() => setDuplicateAction('update')}
                          className='w-4 h-4'
                        />
                        <Label htmlFor='update' className='text-sm'>
                          Atualizar registro duplicado
                        </Label>
                      </div>
                    </div>
                  </div>
                )}

                {showEmailNotification && mode === 'async' && <Separator />}

                {/* Notificação por email (apenas para modo async) */}
                {showEmailNotification && mode === 'async' && (
                  <div className='flex items-center gap-2'>
                    <Checkbox
                      id='emailNotification'
                      checked={emailNotification}
                      onCheckedChange={(checked) => setEmailNotification(checked === true)}
                    />

                    <div className='flex items-center space-x-2'>
                      <MailIcon
                        className='w-4 h-4 text-muted-foreground'
                      />
                      <Label htmlFor='emailNotification' className='text-sm'>
                        Receber email quando a importação terminar
                      </Label>
                    </div>
                  </div>
                )}
              </div>
            )}
        </div>

        <DialogFooter className='shrink-0'>
          <div className='flex gap-2 w-full sm:w-auto'>
            <Button variant='outline' onClick={handleCancel} className='flex-1 sm:flex-none'>
              Cancelar
            </Button>
            <Button
              onClick={handleImport}
              disabled={selectedFiles.length === 0 || loading}
              loading={loading}
              className='flex-1 sm:flex-none'
            >
              {mode === 'async' ? 'Iniciar Importação' : 'Importar'}
              {selectedFiles.length > 0 && (
                <span className='ml-2 bg-white/20 px-2 py-0.5 rounded text-xs'>
                  {selectedFiles.length}
                </span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
