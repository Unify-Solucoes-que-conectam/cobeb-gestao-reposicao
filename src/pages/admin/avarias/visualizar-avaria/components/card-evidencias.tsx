import VisualizarDocumento from "@/components/custom/visualizar-documento"
import { Anexo, Avaria } from "@/types/consults"
import { TruckIcon } from "lucide-react"
import VisualizarEvidencias from "./visualizar-evidencias"
import { Card, CardContent } from "@/components/ui/card"

interface CardEvidenciasProps {
  anexos: Anexo[]
  avaria: Avaria
}

export default function CardEvidencias(props: CardEvidenciasProps) {

  return (
    <div className='flex flex-wrap gap-4'>
      <div className='flex items-center text-md gap-2'>
        <TruckIcon className='text-primary' />
        Evidências
      </div>

      <Card>
        <CardContent className='grid grid-cols-2 gap-2 p-2'>
          {
            props.anexos.length > 0 ? (
              props.anexos.slice(0, 4).map((anexo, index) => (
                <CardEvidencia key={anexo.id} anexo={anexo} anexos={props.anexos} avaria={props.avaria} amount={props.anexos.length} currentIndex={index} />
              ))
            ) : (
              <p>Nenhuma evidência disponível.</p>
            )
          }
        </CardContent>
      </Card>
    </div>
  )
}

interface CardEvidenciaProps {
  anexo: Anexo
  anexos: Anexo[]
  avaria: Avaria
  amount: number
  currentIndex: number
}

export function CardEvidencia(props: CardEvidenciaProps) {
  return (
    <div className='relative w-full h-full rounded-md overflow-hidden border hover:bg-accent cursor-pointer'>
      <VisualizarDocumento
        key={props.anexo.id}
        isImage={['.png', '.jpg', '.jpeg', '.gif'].some(ext => props.anexo.path.endsWith(ext))}
        fileUrl={props.anexo.path}
        fileId={props.anexo.id}
      />
      {
        props.amount > 4 && props.currentIndex === 3 && (
          <VisualizarEvidencias avaria={props.avaria} evidencias={props.anexos} />
        )
      }
    </div>
  )
}