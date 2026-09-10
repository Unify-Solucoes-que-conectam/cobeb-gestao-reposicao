import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface VisualizarDocumentoProps {
  isImage: boolean
  fileUrl: string
  fileId: string
}

export default function VisualizarDocumento({ isImage, fileUrl, fileId }: VisualizarDocumentoProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div key={fileId} className='relative flex h-full w-full cursor-pointer items-center justify-center hover:bg-accent/70'>
          <img src={fileUrl} alt={`evidência_${fileId}`} className='h-full w-full rounded-md border object-cover' />
        </div>
      </DialogTrigger>

      {/* Container padrão com padding (p-4), sem o fundo preto */}
      <DialogContent className="flex max-h-[92vh] w-fit max-w-[calc(100vw-2rem)] flex-col overflow-hidden p-4">

        {/* Cabeçalho padrão sempre visível */}
        <DialogHeader>
          <DialogTitle className="mb-2">
            Visualização {isImage ? "da imagem" : "do documento"} - Evidência {fileId}
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 w-full items-center justify-center overflow-auto rounded-md bg-black/5">
          {isImage ? (
            <img
              src={fileUrl}
              alt={`evidência_${fileId}`}
              className="h-auto max-h-[78vh] w-auto max-w-[calc(100vw-4rem)] rounded-md border object-contain"
            />
          ) : (
            <iframe
              src={fileUrl}
              title={`evidência_${fileId}`}
              className="w-full h-[75vh] rounded-md border bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
