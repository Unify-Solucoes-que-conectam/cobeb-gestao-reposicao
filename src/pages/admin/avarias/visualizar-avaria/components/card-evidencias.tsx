import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Anexo } from "@/types/consults"
import { TruckIcon } from "lucide-react"

interface CardEvidenciasProps {
  anexos: Anexo[]
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

      <CardContent>
        {
          props.anexos.length > 0 ? (
            props.anexos.map(anexo => (
              <CardEvidencia key={anexo.id} anexo={anexo} />
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
}

export function CardEvidencia(props: CardEvidenciaProps) {
  return (
    <div className='w-full h-auto rounded-md overflow-hidden'>
      <img src={props.anexo.path} alt={`evidência_${props.anexo.id}`} className='w-full h-auto rounded-md' />
    </div>
  )
}