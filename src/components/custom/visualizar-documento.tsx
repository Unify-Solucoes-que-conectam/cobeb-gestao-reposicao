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
        <div key={fileId} className='hover:bg-accent/70 cursor-pointer relative flex justify-center items-center'>
          <img src={fileUrl} alt={`evidência_${fileId}`} className='w-full h-auto rounded-md p-4 border object-contain' />
        </div>
      </DialogTrigger>

      {/* Container padrão com padding (p-4), sem o fundo preto */}
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-hidden p-4">

        {/* Cabeçalho padrão sempre visível */}
        <DialogHeader>
          <DialogTitle className="mb-2">
            Visualização {isImage ? "da imagem" : "do documento"} - Evidência {fileId}
          </DialogTitle>
        </DialogHeader>

        <div className="w-full">
          {isImage ? (
            <img
              src={fileUrl}
              alt={`evidência_${fileId}`}
              // Ajustado para ficar igual ao iframe: borda, fundo arredondado e contido na caixa
              className="w-full h-[75vh] object-contain rounded-md border bg-accent/20"
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