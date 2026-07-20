import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NotaFiscal } from "@/types/consults";
import { formatCurrency } from "@/utils/formatters";
import { FileTextIcon, PencilIcon, CheckIcon, XIcon, Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { avariaService } from "@/services/api.service";

interface CardNotasFiscaisProps {
  avariaId: string;
  notasFiscais: NotaFiscal[];
  hasUpdates: (hasUpdates: boolean) => void;
}

export default function CardNotasFiscais(props: CardNotasFiscaisProps) {

  // ========================== States ========================
  const [updatedProducts, setUpdatedProducts] = useState<Record<string, number>>({});

  // validar se o valor do produto mudou
  const originalQuantities = props.notasFiscais.reduce((acc, notaFiscal) => {
    notaFiscal.produtos.forEach(produto => {
      acc[produto.id] = produto.quantidade;
    });
    return acc;
  }, {} as Record<string, number>);

  const hasChanges = Object.keys(updatedProducts).some(produtoId => {
    return updatedProducts[produtoId] !== originalQuantities[produtoId];
  });

  useEffect(() => {
    if (hasChanges) {
      props.hasUpdates(true);
    }
  }, [updatedProducts]);

  return (
    <Card className='flex-1'>
      <CardHeader>
        <CardTitle className='flex items-center text-md gap-2'>
          <FileTextIcon className='text-primary' />
          Notas Fiscais e Produtos
        </CardTitle>
      </CardHeader>

      <CardContent>
        {
          props.notasFiscais.map(notaFiscal => (
            <CardNotaFiscal
              key={notaFiscal.id}
              notaFiscal={notaFiscal}
              avariaId={props.avariaId}
              setUpdatedProducts={setUpdatedProducts}
            />
          ))
        }
      </CardContent>
    </Card>
  )
}

interface CardNotaFiscalProps {
  notaFiscal: NotaFiscal;
  avariaId: string;
  setUpdatedProducts: React.Dispatch<React.SetStateAction<Record<string, number>>>;
}

export function CardNotaFiscal(props: CardNotaFiscalProps) {
  const [editingProdutoId, setEditingProdutoId] = useState<string | null>(null);
  const [newQuantity, setNewQuantity] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditClick = (produto: any) => {
    setEditingProdutoId(produto.id);
    setNewQuantity(produto.quantidade);
  };

  const handleSave = async (produtoId: string) => {
    setIsSaving(true);
    try {
      const response = await avariaService.atualizarQuantidadeAvariada(props.avariaId, produtoId, newQuantity ?? 0);
      props.setUpdatedProducts(prev => ({ ...prev, [produtoId]: newQuantity ?? 0 }));

      if (response.success) {
        setEditingProdutoId(null);
      }
    } catch (error) {
      console.error("Erro ao atualizar quantidade", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-4 last:mb-0">
      <CardHeader className='border-b p-4'>
        <CardTitle className='flex justify-between items-center gap-2 text-md'>
          <div className='flex items-center gap-2'>
            NF {props.notaFiscal.numero}
            <Badge variant='outline'>
              Pedido: {props.notaFiscal.pedido}
            </Badge>
          </div>

          <p className='text-emerald-500 m-0'>{formatCurrency(props.notaFiscal.valor_total)}</p>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4">
        {
          props.notaFiscal.produtos.map(produto => (
            <div key={produto.id} className='flex items-center justify-between gap-2 mt-3 first:mt-0'>
              <p className="flex-1 text-sm">{produto.descricao}</p>

              {editingProdutoId === produto.id ? (
                // MODO EDIÇÃO
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={newQuantity ?? 0}
                    onChange={(e) => setNewQuantity(Number(e.target.value))}
                    className="w-20 h-8 text-center"
                    min={1}
                    disabled={isSaving}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleSave(produto.id)}
                    disabled={isSaving}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8"
                  >
                    {isSaving ? <Loader2Icon className="animate-spin size-4" /> : <CheckIcon size={18} />}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => setEditingProdutoId(null)}
                    disabled={isSaving}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  >
                    <XIcon size={18} />
                  </Button>
                </div>
              ) : (
                // MODO LEITURA
                <div className="flex items-center gap-3">
                  <p className="text-sm font-medium">{newQuantity !== null ? newQuantity : produto.quantidade} unidades</p>
                  <Badge variant='outline' className="text-xs">AVARIADO</Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditClick(produto)}
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <PencilIcon size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))
        }
      </CardContent>
    </Card>
  )
}