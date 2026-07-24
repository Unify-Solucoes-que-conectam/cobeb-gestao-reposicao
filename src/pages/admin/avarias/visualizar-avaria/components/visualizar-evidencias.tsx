import VisualizarDocumento from "@/components/custom/visualizar-documento"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import { Anexo, Avaria } from "@/types/consults"

interface VisualizarEvidenciasProps {
  avaria: Avaria
  evidencias: Anexo[]
}

export default function VisualizarEvidencias(props: VisualizarEvidenciasProps) {
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
          <div className='absolute top-0 left-0 bg-accent/70 rounded-md flex items-center justify-center w-full h-full text-4xl font-bold'>
            +{props.evidencias.length - 3}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Evidências da Avaria {props.avaria.id}</DialogTitle>
            <DialogDescription>
              Visualize todas as evidências relacionadas a esta avaria.
            </DialogDescription>
          </DialogHeader>

          <Card className='p-2'>
            <CardContent className='grid grid-cols-3 gap-2 overflow-auto h-auto p-0'>
              {
                props.evidencias.map(evidencia => (
                  <VisualizarDocumento
                    key={evidencia.id}
                    isImage={['.png', '.jpg', '.jpeg', '.gif'].some(ext => evidencia.path.endsWith(ext))}
                    fileUrl={evidencia.path}
                    fileId={evidencia.id}
                  />
                ))
              }
            </CardContent>
          </Card>
        </DialogContent>
      </form>
    </Dialog>
  )
}
