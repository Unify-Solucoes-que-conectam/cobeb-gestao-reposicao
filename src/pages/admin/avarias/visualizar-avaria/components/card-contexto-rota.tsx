import { Card, CardContent } from "@/components/ui/card"
import { Motorista } from "@/types/consults"
import { TruckIcon } from "lucide-react"

interface CardContextoRotaProps {
  motorista: Motorista
}

export default function CardContextoRota(props: CardContextoRotaProps) {

  return (
    <div className="flex flex-wrap gap-4">
      <div className='flex items-center text-md gap-2'>
        <TruckIcon className='text-primary' />
        Contexto da Rota
      </div>

      <Card className="w-full">
        <CardContent className='p-3 flex flex-col gap-3'>
          <div>
            <span className='text-muted-foreground font-bold'>Motorista</span>
            <p className='uppercase'>{props.motorista.nome}</p>
          </div>

          <div>
            <span className='text-muted-foreground font-bold'>Mapa</span>
            <p className='uppercase'>{props.motorista.mapa!.codigo}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}