import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Cliente } from '@/types/consults'
import { formatDocumento, formatPhoneDisplay } from '@/utils/formatters'
import { BuildingIcon, MapPinIcon, PhoneIcon } from 'lucide-react'

interface CardClienteProps {
  cliente: Cliente
}

export default function CardCliente({ cliente }: CardClienteProps) {
  const cidadeUf = [cliente.cidade, cliente.uf].filter(Boolean).join('/')
  const endereco = [cliente.endereco, cliente.complemento, cliente.bairro, cidadeUf].filter(Boolean).join(' • ')
  const contatos = cliente.contatos ?? []

  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
        <span className="rounded-md bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950"><BuildingIcon className="size-4" /></span>
        Cliente
      </div>

      <Card className="shadow-none">
        <CardContent className="space-y-3 p-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{cliente.razao_social}</p>
            {cliente.nome_fantasia && cliente.nome_fantasia !== cliente.razao_social && (
              <p className="truncate text-[11px] text-muted-foreground">{cliente.nome_fantasia}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <p className="text-[9px] font-bold uppercase text-slate-400">Código</p>
              <p className="mt-1 text-xs font-semibold">{cliente.codigo || 'Não informado'}</p>
            </div>
            <div className="rounded-md bg-slate-50 p-2.5 dark:bg-slate-900/50">
              <p className="text-[9px] font-bold uppercase text-slate-400">{cliente.tipo_pessoa === 'F' ? 'CPF' : 'CPF/CNPJ'}</p>
              <p className="mt-1 text-xs font-semibold">{formatDocumento(cliente.documento) || 'Não informado'}</p>
            </div>
          </div>

          {endereco && (
            <div className="flex items-start gap-2 border-t pt-3 text-xs text-muted-foreground">
              <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-rose-500" />
              <span>{endereco}{cliente.cep ? ` • CEP ${cliente.cep}` : ''}</span>
            </div>
          )}

          {contatos.length > 0 && (
            <div className="space-y-1.5 border-t pt-3">
              {contatos.map((contato, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  <PhoneIcon className="size-3.5 shrink-0 text-slate-400" />
                  <span className="font-medium">{formatPhoneDisplay(contato.telefone ?? '')}</span>
                  {contato.isWhatsapp && <Badge className="px-1.5 py-0 text-[9px]">WhatsApp</Badge>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
