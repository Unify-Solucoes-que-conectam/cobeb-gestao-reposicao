import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import dayjs from '@/lib/dayjs'
import { avariaService, itemAvariaService } from '@/services/api.service'
import { ItemAvaria, NotaFiscal } from '@/types/consults'
import { CheckIcon, FileTextIcon, Loader2Icon, PackageIcon, PencilIcon, XIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface CardNotaFiscalProps {
  avariaId: string
  notaFiscal: NotaFiscal
  itens: ItemAvaria[]
  canEdit: boolean
}
export default function CardNotaFiscal({ avariaId, notaFiscal, itens, canEdit }: CardNotaFiscalProps) {
  const quantidadeTotal = itens.reduce((total, item) => total + Number(item.produto.quantidade_avariada), 0)

  return (
    <section className="min-w-0 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          <span className="rounded-md bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950"><FileTextIcon className="size-4" /></span>
          Nota fiscal e produtos
        </div>
        <span className="text-xs text-muted-foreground">{itens.length} {itens.length === 1 ? 'item registrado' : 'itens registrados'}</span>
      </div>

      <Card className="shadow-none">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3 text-xs">
          <div className="flex items-center gap-2 font-semibold">
            <FileTextIcon className="size-4 text-slate-400" />
            NF-e #{notaFiscal.numero}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-muted-foreground">
            <span>Pedido: <strong className="text-foreground">{notaFiscal.pedido || 'Não informado'}</strong></span>
            <span>Emissão: <strong className="text-foreground">{dayjs(notaFiscal.data_emissao).format('DD/MM/YYYY')}</strong></span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2.5">
        {itens.map((item) => (
          <CardItemAvaria key={item.id} avariaId={avariaId} canEdit={canEdit} item={item} />
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-slate-50 px-4 py-3 text-xs dark:bg-slate-900/40">
        <span className="text-muted-foreground">Total declarado: <strong className="text-foreground">{itens.length} {itens.length === 1 ? 'produto' : 'produtos'}</strong></span>
        <span className="text-muted-foreground">Quantidade avariada: <strong className="text-rose-600">{quantidadeTotal} un.</strong></span>
      </div>
    </section>
  )
}

interface CardItemAvariaProps {
  item: ItemAvaria
  avariaId: string
  canEdit: boolean
}

function CardItemAvaria({ item, avariaId, canEdit }: CardItemAvariaProps) {
  const [editing, setEditing] = useState(false)
  const [newQuantity, setNewQuantity] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [updatedItem, setUpdatedItem] = useState<ItemAvaria | null>(null)
  const currentQuantity = updatedItem?.produto.quantidade_avariada ?? item.produto.quantidade_avariada
  const exchangedQuantity = item.trocas?.reduce((total, troca) => total + troca.quantidade, 0) ?? 0
  const typeCode = item.produto.tipo_avaria.codigo
  const isDamage = typeCode === '5'

  const fetchItem = async () => {
    const response = await itemAvariaService.read({ id: avariaId })
    if (response.success) {
      setUpdatedItem(response.data.find((candidate) => candidate.id === item.id) || item)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await avariaService.atualizarQuantidadeAvariada(avariaId, item.id, newQuantity ?? 0)
      if (response.success) {
        setEditing(false)
        setNewQuantity(null)
        await fetchItem()
      } else {
        toast.error(response.message || 'Erro ao atualizar quantidade.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className={`overflow-hidden border-l-4 shadow-none ${isDamage ? 'border-l-amber-500' : 'border-l-violet-500'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-lg p-2.5 ${isDamage ? 'bg-amber-50 text-amber-600' : 'bg-violet-50 text-violet-600'}`}>
            <PackageIcon className="size-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.produto.descricao}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">Código do produto: {item.produto.codigo}</p>
              </div>
              <Badge variant="outline" className="font-mono text-[10px]">CÓD: {item.produto.codigo}</Badge>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={isDamage ? 'border border-amber-200 bg-amber-50 text-amber-700' : 'border border-violet-200 bg-violet-50 text-violet-700'}>
                  {item.produto.tipo_avaria.nome}
                </Badge>
                <span className="text-xs text-muted-foreground"><strong className="text-foreground">{currentQuantity}</strong> un. de {item.produto.quantidade_total} na nota</span>
                {exchangedQuantity > 0 && (
                  <Badge className="border border-violet-200 bg-violet-50 text-violet-700">
                    {exchangedQuantity} un. atendida{exchangedQuantity === 1 ? '' : 's'} na troca
                  </Badge>
                )}
              </div>

              {editing ? (
                <div className="flex items-center gap-1.5">
                  <Input
                    type="number"
                    min={1}
                    max={item.produto.quantidade_total}
                    value={newQuantity ?? ''}
                    onChange={(event) => {
                      const quantity = Math.max(0, Number.parseInt(event.target.value, 10) || 0)
                      if (quantity > item.produto.quantidade_total) {
                        toast.warning(`A quantidade avariada não pode ser maior que a quantidade da nota (${item.produto.quantidade_total}).`)
                      }
                      setNewQuantity(Math.min(quantity, item.produto.quantidade_total))
                    }}
                    className="h-8 w-20 text-center"
                  />
                  <Button size="icon" variant="ghost" className="size-8 text-emerald-600" onClick={handleSave} disabled={isSaving || !newQuantity}>
                    {isSaving ? <Loader2Icon className="size-4 animate-spin" /> : <CheckIcon className="size-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="size-8 text-rose-600" onClick={() => setEditing(false)} disabled={isSaving}>
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 gap-1.5 text-xs"
                  onClick={() => { setNewQuantity(currentQuantity); setEditing(true) }}
                  disabled={!canEdit}
                  title={canEdit ? 'Editar quantidade' : 'A quantidade só pode ser alterada antes da decisão'}
                >
                  <PencilIcon className="size-3.5" /> Editar quantidade
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
