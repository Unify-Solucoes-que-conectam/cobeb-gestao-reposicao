import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anexo, Avaria } from "@/types/consults"
import { TruckIcon } from "lucide-react"
import VisualizarEvidencias from "./visualizar-evidencias"
import VisualizarDocumento from "@/components/custom/visualizar-documento"

interface CardEvidenciasProps {
  anexos: Anexo[]
  avaria: Avaria
}

export default function CardEvidencias(props: CardEvidenciasProps) {

  return (
    <Card className='w-full md:w-90'>
      <CardHeader>
        <CardTitle className='flex items-center text-md gap-2'>
          <TruckIcon className='text-primary' />
          Evidências
        </CardTitle>
      </CardHeader>

      <CardContent className='grid grid-cols-2 gap-2'>
        {
          props.anexos.length > 0 ? (
            props.anexos.slice(0, 4).map((anexo, index) => (
              <CardEvidencia key={anexo.id}  anexo={anexo} anexos={props.anexos} avaria={props.avaria} amount={props.anexos.length} currentIndex={index}/>
            ))
          ) : (
            <p>Nenhuma evidência disponível.</p>
          )
        }
      </CardContent>
    </Card>
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
          <VisualizarEvidencias avaria={props.avaria} evidencias={props.anexos}/>
        )
      }
    </div>
  )
}