import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { avariaService, itemAvariaService } from "@/services/api.service";
import { ItemAvaria, NotaFiscal } from "@/types/consults";
import { CheckIcon, FileTextIcon, Loader2Icon, PencilIcon, XIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CardNotaFiscalProps {
  avariaId: string
  notaFiscal: NotaFiscal
  itens: ItemAvaria[]
  canEdit: boolean
}

export default function CardNotaFiscal(props: CardNotaFiscalProps) {

  return (
    <div className='flex-1 flex flex-col gap-3 max-h-[calc(100vh-16rem)]'>
      <div className="flex gap-2 items-center">
        <FileTextIcon className='text-primary' />
        Notas Fiscais e Produtos
      </div>

      <div className='flex flex-col gap-2 overflow-auto'>
        {
          props.itens.map(item => (
            <CardItemAvaria
              key={item.id}
              avariaId={props.avariaId}
              canEdit={props.canEdit}
              item={item}
            />
          ))
        }
      </div>
    </div>
  )
}

interface CardItemAvariaProps {
  item: ItemAvaria;
  avariaId: string;
  canEdit: boolean;
}

export function CardItemAvaria(props: CardItemAvariaProps) {

  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [updatedItem, setUpdatedItem] = useState<ItemAvaria | null>(null);

  const handleEditClick = (item: ItemAvaria) => {
    setEditingItemId(item.id);
    setNewQuantity(item.produto.quantidade_avariada);
  };

  const handleSave = async (produtoId: string) => {
    setIsSaving(true);
    try {
      const response = await avariaService.atualizarQuantidadeAvariada(props.avariaId, produtoId, newQuantity ?? 0);

      if (response.success) {
        setEditingItemId(null);

        const controller = new AbortController();
        const signal = controller.signal;
        fetchItensAvaria({ signal });
        // reseta a quantidade nova para evitar que o valor antigo seja exibido ao reabrir o modo de edição
        setNewQuantity(null);
      } else {
        toast.error(response.message || 'Erro ao atualizar quantidade. Tente novamente mais tarde.');
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade", error);
    } finally {
      setIsSaving(false);
    }
  };

  const statusColors = {
    '5': 'bg-yellow-100 text-yellow-500 border-yellow-200 hover:bg-yellow-200 hover:text-yellow-500',
    '39': 'bg-violet-100 text-violet-500 border-violet-200 hover:bg-violet-200 hover:text-blue-500',
  };

  const statusLabels = {
    '5': 'Avariado',
    '39': 'Inversão',
  };

  /**
   * Consultar itens da avaria
   */
  const fetchItensAvaria = async ({ signal }: { signal?: AbortSignal } = {}) => {
    const response = await itemAvariaService.read({ id: props.avariaId }, signal);

    if (response.success) {
      const foundItem = response.data.find(item => item.id === props.item.id) || props.item;
      setUpdatedItem(foundItem);
      console.log(foundItem)
    } else {
      toast.error(response.message || 'Erro ao consultar itens da avaria. Tente novamente mais tarde.');
    }
  }

  return (
    <Card className={`group transition-all duration-200 hover:shadow-md border border-slate-200 border-l-4 bg-white ${props.item.produto.tipo_avaria.codigo === '5'
      ? 'border-l-amber-500'
      : props.item.produto.tipo_avaria.codigo === '39'
        ? 'border-l-purple-500'
        : 'border-l-slate-400'
      }`}>
      <CardContent className="p-3.5">
        {/* Topo do Card: Nome do Produto e Código */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="font-bold text-slate-800 text-sm leading-snug group-hover:text-blue-600 transition-colors">
            {props.item.produto.descricao}
          </h4>
          <Badge
            variant="outline"
            className="font-mono text-[11px] font-semibold bg-slate-50 text-slate-600 border-slate-200 shrink-0 whitespace-nowrap"
          >
            CÓD: {props.item.produto.codigo}
          </Badge>
        </div>

        {/* Rodapé do Card: Quantidade, Status e Ações */}
        <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-slate-100 text-xs">
          {/* Lado Esquerdo: Quantidade e Badge de Status */}
          <div className="flex items-center gap-2">
            <Badge className="font-bold text-slate-700 bg-slate-100 hover:bg-slate-100 px-2.5 py-1 rounded-lg flex gap-1 items-center">
              {updatedItem?.produto.quantidade_avariada ?? props.item.produto.quantidade_avariada} <span className="font-normal text-slate-500">
                {(updatedItem?.produto.quantidade_avariada === 1 || props.item.produto.quantidade_avariada === 1) ? 'unidade avariada' : 'unidades avariadas'}
              </span>
            </Badge>
            <Badge className={`text-xs font-semibold rounded-md ${statusColors[props.item.produto.tipo_avaria.codigo]}`}>
              {statusLabels[props.item.produto.tipo_avaria.codigo]}
            </Badge>
          </div>

          {/* Lado Direito: Modo Edição vs Modo Leitura */}
          {editingItemId === props.item.id ? (
            // MODO EDIÇÃO
            <div className="flex items-center gap-1.5">
              <Input
                type="number"
                value={newQuantity || ''}
                placeholder="0"
                min={0}
                max={props.item.produto.quantidade_total}
                onChange={(e) => {
                  const raw = e.target.value;

                  if (raw === '') {
                    setNewQuantity(0);
                    return;
                  }

                  const max = props.item.produto.quantidade_total;
                  const parsed = Math.max(0, parseInt(raw, 10) || 0);

                  setNewQuantity(max !== undefined && parsed > max ? max : parsed);

                  if (max !== undefined && parsed > max) {
                    toast.warning(`A quantidade avariada não pode ser maior que a quantidade total contida na nota fiscal (${max}).`);
                  }
                }}
                onBlur={() => {
                  if (!newQuantity || newQuantity < 0) {
                    setNewQuantity(0);
                  }
                }}
                className="w-16 h-8 text-center text-xs font-bold border-slate-300 focus-visible:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSave(props.item.id)}
                disabled={isSaving}
                className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 h-8 w-8 rounded-lg"
                title="Salvar"
              >
                {isSaving ? <Loader2Icon className="animate-spin size-4" /> : <CheckIcon size={18} />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditingItemId(null)}
                disabled={isSaving}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-8 w-8 rounded-lg"
                title="Cancelar"
              >
                <XIcon size={18} />
              </Button>
            </div>
          ) : (
            // MODO LEITURA
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEditClick(props.item)}
              className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Editar quantidade"
              disabled={isSaving || !props.canEdit}
            >
              <PencilIcon size={16} />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}