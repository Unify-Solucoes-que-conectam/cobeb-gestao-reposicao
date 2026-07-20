import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mapa } from "@/types/consults"
import { TruckIcon } from "lucide-react"

interface CardContextoRotaProps {
  mapa: Mapa
}

export default function CardContextoRota(props: CardContextoRotaProps) {

  return (
    <Card className='w-full md:w-90'>
      <CardHeader>
        <CardTitle className='flex items-center text-md gap-2'>
          <TruckIcon className='text-primary' />
          Contexto da Rota
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Card>
          <CardContent className='p-3 flex flex-col gap-3'>
            <div>
              <span className='text-muted-foreground font-bold'>Motorista</span>
              <p className='uppercase'>{props.mapa.motorista.nome}</p>
            </div>

            <div>
              <span className='text-muted-foreground font-bold'>Mapa</span>
              <p className='uppercase'>{props.mapa.codigo}</p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}