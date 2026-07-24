import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export default function CardNotaFiscal(props: CardNotaFiscalProps) {

  return (
    <div className='flex-1 flex flex-col gap-3'>
      <div className="flex gap-2 items-center">
        <FileTextIcon className='text-primary' />
        Notas Fiscais e Produtos
      </div>

      <div className='flex flex-col gap-2'>
        {
          props.itens.map(item => (
            <CardItemAvaria
              key={item.id}
              item={item}
              avariaId={props.avariaId}
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
}

export function CardItemAvaria(props: CardItemAvariaProps) {
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (item: ItemAvaria) => {
    setEditingItemId(item.id);
    setNewQuantity(item.quantidade_avariada);
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
      props.item = response.data.find(item => item.id === props.item.id) || props.item;
    } else {
      toast.error(response.message || 'Erro ao consultar itens da avaria. Tente novamente mais tarde.');
    }
  }

  return (
    <Card>
      <CardHeader className='border-b p-4'>
        <CardTitle className='flex justify-between items-center gap-2 text-md'>
          PRODUTO {props.item.produto.descricao}
          <Badge variant='outline'>
            CÓDIGO: {props.item.produto.codigo}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        <div className='flex items-center justify-between gap-2 mt-3 first:mt-0'>
          <p className="flex-1 text-sm">{props.item.produto.descricao}</p>

          {editingItemId === props.item.id ? (
            // MODO EDIÇÃO
            <div className="flex items-center gap-2">
              <Input
                type="number"
                // Exibe vazio se for 0/null/undefined para não travar o "0" visualmente ao digitar
                value={newQuantity || ''}
                placeholder="0"
                min={0}
                max={props.item.produto.quantidade_total}
                onChange={(e) => {
                  const raw = e.target.value;

                  // Permite apagar o campo sem forçar o 0 de imediato
                  if (raw === '') {
                    setNewQuantity(0);
                    return;
                  }

                  const max = props.item.produto.quantidade_total;
                  const parsed = Math.max(0, parseInt(raw, 10) || 0);

                  // Aplica o limite máximo se houver produto carregado
                  setNewQuantity(max !== undefined && parsed > max ? max : parsed);

                  // gera um alerta se o usuário tentar digitar um valor maior que o máximo permitido
                  if (max !== undefined && parsed > max) {
                    toast.warning(`A quantidade avariada não pode ser maior que a quantidade total contida na nota fiscal (${max}).`);
                  }
                }}
                onBlur={() => {
                  // Ao sair do campo vazio ou inválido, garante que o valor volte a ser 0
                  if (!newQuantity || newQuantity < 0) {
                    setNewQuantity(0);
                  }
                }}
                className="text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleSave(props.item.id)}
                disabled={isSaving}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
              >
                {isSaving ? <Loader2Icon className="animate-spin size-4" /> : <CheckIcon size={18} />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditingItemId(null)}
                disabled={isSaving}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
              >
                <XIcon size={18} />
              </Button>
            </div>
          ) : (
            // MODO LEITURA
            <div className="flex items-center gap-3">
                <p className="text-sm font-medium">{props.item.quantidade_avariada} unidades</p>
              <Badge className={`text-xs font-semibold rounded-md ${statusColors[props.item.tipo_avaria.codigo]}`}>
                {statusLabels[props.item.tipo_avaria.codigo]}
              </Badge>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => handleEditClick(props.item)}
                className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
              >
                <PencilIcon size={16} />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}