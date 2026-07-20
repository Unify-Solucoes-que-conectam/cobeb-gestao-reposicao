import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotaFiscal } from "@/types/consults";
import { formatCurrency } from "@/utils/formatters";
import { FileTextIcon } from "lucide-react";

interface CardNotasFiscaisProps {
  notasFiscais: NotaFiscal[]
}

export default function CardNotasFiscais(props: CardNotasFiscaisProps) {

  return (
    <Card>
      <CardHeader>
        <CardTitle className='flex items-center text-md gap-2'>
          <FileTextIcon className='text-primary' />
          Notas Fiscais e Produtos
        </CardTitle>
      </CardHeader>

      <CardContent>
        {
          props.notasFiscais.map(notaFiscal => (
            <CardNotaFiscal key={notaFiscal.id} notaFiscal={notaFiscal} />
          ))
        }
      </CardContent>
    </Card>
  )
}

interface CardNotaFiscalProps {
  notaFiscal: NotaFiscal
}

export function CardNotaFiscal(props: CardNotaFiscalProps) {
  return (
    <Card>
      <CardHeader className='border-b'>
        <CardTitle className='flex justify-between gap-2 text-md'>
          <div className='flex items-center gap-2'>
            NF {props.notaFiscal.numero}
            <Badge variant='outline'>
              Pedido: {props.notaFiscal.pedido}
            </Badge>
          </div>

          <p className='text-emerald-500'>{formatCurrency(props.notaFiscal.valor_total)}</p>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {
          props.notaFiscal.produtos.map(produto => (
            <div key={produto.id} className='flex justify-between gap-2 mt-4'>
              <p>{produto.descricao}</p>
              <p>{produto.quantidade} unidades</p>
              <Badge variant='outline'>AVARIADO</Badge>
            </div>
          ))
        }
      </CardContent>
    </Card>
  )
}