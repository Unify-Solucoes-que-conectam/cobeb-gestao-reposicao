import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useDebounce } from "@/hooks/use-debounce";
import { notaFiscalService, tiposAvariaService } from "@/services/api.service";
import { NotaFiscal, TiposAvaria } from "@/types/consults";
import { convertFileToBase64 } from "@/utils/conversors";
import { formatCurrency } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, CheckIcon, FileTextIcon, ImageIcon, MinusIcon, PlusIcon, SendIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CadastrarAvariaSchema, initValues, schema } from "./schemas/avaria";

export default function ClientRegistrarAvarias() {

  // ===================== Formulário de cadastro de avarias =======================
  const form = useForm<CadastrarAvariaSchema>({
    resolver: zodResolver(schema),
    defaultValues: initValues,
    mode: "onSubmit"
  })

  // =============================== States de dados ===============================
  const [tiposAvaria, setTiposAvaria] = useState<TiposAvaria[]>([]);
  const [imageName, setImageName] = useState<{
    name: string;
  } | null>(null);

  // =============================== States de passos ===============================
  const [notaFiscalData, setNotaFiscalData] = useState<NotaFiscal | null>(null);

  /**
   * função para registrar avarias
   */
  const handleSubmit = async (data: CadastrarAvariaSchema) => {
    console.log('Formulário submetido:', data);
  }

  /**
   * função para consultar tipos de avaria
   */
  const fetchTiposAvaria = async () => {
    const response = await tiposAvariaService.read();

    if (response.success) {
      setTiposAvaria(response.data);
    } else {
      toast.error(response.message || 'Erro ao consultar tipos de avaria');
    }
  }

  /**
   * useEffect a ser disparado ao carregar página
   */
  useEffect(() => {
    fetchTiposAvaria();
  }, []);

  // =================================== Watchers ==================================
  const notaFiscalWatcher = form.watch('nota_fiscal');
  const produtoWatcher = form.watch('produto');

  /**
   * useDebounce para consultar nota fiscal
   */
  const notaFiscalDebounced = useDebounce(async (numeroNota: string) => {

    if (!numeroNota) {
      setNotaFiscalData(null);
      return;
    }

    try {
      const response = await notaFiscalService.read(numeroNota, true);
      const notaFiscal = response.data[0];

      if (notaFiscal) {
        setNotaFiscalData(notaFiscal);
        form.clearErrors('nota_fiscal');
      } else {
        setNotaFiscalData(null);
        form.setError('nota_fiscal', {
          type: 'manual',
          message: 'Nota Fiscal não encontrada.'
        });
      }
    } catch (error) {
      console.error('Erro ao buscar Nota Fiscal:', error);
      form.setError('nota_fiscal', {
        type: 'manual',
        message: 'Nota Fiscal não encontrada.'
      });
    }
  }, 800);

  /**
   * Verifica se o produto informado está presente na nota fiscal
   */
  const produtoEncontrado = notaFiscalData?.produtos.find(produto => produto.codigo === form.getValues('produto'));

  /**
   * useDebounce para controlar campo produto
   */
  const produtoDebounced = useDebounce(async () => {

    if (produtoEncontrado) {
      form.clearErrors('produto');
    } else {
      form.setError('produto', {
        type: 'manual',
        message: 'Produto não encontrado na Nota Fiscal.'
      });
    }
  }, 800);

  /**
   * useEffect para disparar a consulta da nota fiscal quando o campo for alterado
   */
  useEffect(() => {
    notaFiscalDebounced(notaFiscalWatcher);
    
    if (notaFiscalData) {
      produtoDebounced();
    }
  }, [notaFiscalWatcher, produtoWatcher])

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto no-scrollbar">

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 pb-20">

          {/* NOTA_FISCAL_FIELD */}
          <FormField
            control={form.control}
            name='nota_fiscal'
            render={({ field }) => (
              <FormItem className="w-full">
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle className="flex justify-between items-center">
                      <FormLabel className="text-blue-700 font-bold text-lg" required>NOTA FISCAL</FormLabel>
                      {
                        notaFiscalData !== null && (
                          <Badge className="text-emerald-700 bg-emerald-100 hover:bg-emerald-100 text-sm gap-2">
                            Carregada
                            <CheckIcon size={20} />
                          </Badge>
                        )
                      }
                    </CardTitle>
                    <CardDescription>
                      Digite o número da Nota Fiscal
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">

                    <FormControl>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          {...field}
                          placeholder="Ex: 972909"
                        />
                        <InputGroupAddon>
                          <FileTextIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>

                    <FormMessage />
                  </CardContent>

                  {
                    notaFiscalData !== null && (
                      <CardFooter className="p-2">
                        <Card className="flex items-center p-3 w-full justify-between">
                          <CardHeader className="p-0">
                            <CardTitle>NF {notaFiscalData.numero}</CardTitle>
                            <CardDescription className="font-thin">Cliente: {notaFiscalData.cliente.razao_social}</CardDescription>
                          </CardHeader>
                          <CardContent className="text-blue-700 font-bold text-xl p-0">
                            {formatCurrency(notaFiscalData.valor_total)}
                          </CardContent>
                        </Card>
                      </CardFooter>
                    )
                  }
                </Card>
              </FormItem>
            )}
          />

          {/* CODIGO_PRODUTO_FIELD */}
          <FormField
            control={form.control}
            name='produto'
            render={({ field }) => (
              <FormItem>
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle className="flex justify-between items-center">
                      <FormLabel className="text-blue-700 font-bold text-lg " required>CÓDIGO DO PRODUTO</FormLabel>
                      {
                        produtoEncontrado && (
                          <Badge className="text-emerald-700 bg-emerald-100 hover:bg-emerald-100 text-sm gap-2">
                            Carregado
                            <CheckIcon size={20} />
                          </Badge>
                        )
                      }
                    </CardTitle>
                    <CardDescription>
                      Digite o código do produto na nota
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">

                    <FormControl>
                      <InputGroup className="h-10">
                        <InputGroupInput
                          {...field}
                          placeholder="Ex: 7001"
                        />
                        <InputGroupAddon>
                          <FileTextIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>

                    <FormMessage />
                  </CardContent>

                  {
                    produtoEncontrado && (
                      <CardFooter className="p-2">
                        <Card className="p-3 w-full">
                          <CardHeader className="p-0 w-full">
                            <div className="w-full">
                              <CardTitle
                                title={produtoEncontrado.descricao}
                                className="w-full"
                              >
                                {produtoEncontrado.descricao}
                              </CardTitle>
                            </div>
                            <CardDescription className="font-thin flex justify-between">
                              <span>Código: {produtoEncontrado.codigo}</span>
                              <span>Disponível: {produtoEncontrado.quantidade}</span>
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      </CardFooter>
                    )
                  }
                </Card>
              </FormItem>
            )}
          />

          {/* TIPO_AVARIA_FIELD */}
          <FormField
            control={form.control}
            name='tipo_avaria'
            render={({ field }) => (
              <FormItem className="w-full">
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle>
                      <FormLabel className="text-blue-700 font-bold text-lg" required>TIPO DE AVARIA</FormLabel>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">

                    <FormControl>

                      {/* TIPO_AVARIADO */}
                      <RadioGroup value={field.value} onValueChange={(value) => field.onChange(value)}>
                        {
                          tiposAvaria.map(tipo => (
                            <Label key={tipo.id} htmlFor={tipo.id} className="cursor-pointer">
                              <Card className="flex items-center p-3 gap-3">

                                <div className="flex items-center justify-center">
                                  <RadioGroupItem value={tipo.id} id={tipo.id} />
                                </div>

                                <CardHeader className="p-0">
                                  <CardTitle className="text-lg font-bold">
                                    {tipo.nome}
                                  </CardTitle>
                                  <CardDescription>
                                    {tipo.descricao}
                                  </CardDescription>
                                </CardHeader>
                              </Card>
                            </Label>
                          ))
                        }
                      </RadioGroup>
                    </FormControl>

                    <FormMessage />
                  </CardContent>
                </Card>
              </FormItem>
            )}
          />

          {/* QUANTIDADE_AVARIADA_FIELD */}
          <FormField
            control={form.control}
            name='quantidade_avariada'
            render={({ field }) => (
              <FormItem className="w-full">
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle>
                      <FormLabel className="text-blue-700 font-bold text-lg" required>QUANTIDADE AVARIADA</FormLabel>
                    </CardTitle>
                    <CardDescription>
                      Selecione a quantidade avariada
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-2">

                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" type="button" className="flex-1 text-blue-700 bg-blue-500/20" disabled={(field.value || 0) <= 0} onClick={() => field.onChange(Math.max((field.value || 0) - 1, 0))}>
                            <MinusIcon />
                          </Button>
                          <Input
                            type="number"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            min={0}
                            max={produtoEncontrado?.quantidade ?? 999}
                            className="text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button variant="outline" type="button" className="flex-1 text-blue-700 bg-blue-500/20" disabled={(field.value || 0) >= (produtoEncontrado?.quantidade ?? 999)} onClick={() => field.onChange(Math.min((field.value || 0) + 1, produtoEncontrado?.quantidade ?? 999))}>
                            <PlusIcon />
                          </Button>
                        </div>
                        <Button type="button" className="flex-1" onClick={() => field.onChange(produtoEncontrado?.quantidade ?? 999)}>
                          SELECIONAR TUDO
                        </Button>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </CardContent>
                </Card>
              </FormItem>
            )}
          />

          {/* ALERTA_IMAGEM */}
          <Card className="flex items-center px-1 py-2 border-dotted border-2 border-amber-700 bg-amber-100">
            <div className="p-3">
              <TriangleAlertIcon className="text-amber-700 size-7" />
            </div>
            <CardHeader className="p-0">
              <CardTitle className="text-amber-700 font-bold text-xl m-0">
                Atenção
              </CardTitle>
              <CardDescription className="text-amber-700 font-thin">
                A imagem deve conter o lote do produto
              </CardDescription>
            </CardHeader>
          </Card>

          {/* IMAGEM_FIELD */}
          <FormField
            control={form.control}
            name='imagem'
            render={({ field }) => (
              <FormItem className="w-full">
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle>
                      <FormLabel className="text-blue-700 font-bold text-lg" required>FOTOGRAFAR AVARIA</FormLabel>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">

                    <FormControl>
                      <Label htmlFor="imagem">
                        {
                          field.value ? (
                            <Card className="flex items-center p-3 border-dotted border-2 cursor-pointer gap-3">
                              <div className="flex items-center justify-center p-3 border rounded-md">
                                <ImageIcon className="text-emerald-700 size-7" />
                              </div>
                              <CardHeader className="p-0">
                                <CardTitle className="font-bold text-xl m-0 text-emerald-700">
                                  Foto da avaria capturada
                                </CardTitle>
                                <CardDescription className="font-thin text-gray-400">
                                  {imageName?.name}
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          ) : (
                            <Card className="flex flex-col items-center p-3 border-dotted border-2 bg-gray-50 cursor-pointer">
                              <CardHeader className="p-0 items-center">
                                <CardTitle className="flex flex-col items-center font-bold text-xl m-0">
                                  <CameraIcon className="text-gray-500 size-7" />
                                  Tire uma foto
                                </CardTitle>
                                <CardDescription className="font-thin text-gray-400">
                                  Toque para tirar a foto do(s) produto(s) avariado(s)
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          )
                        }
                        <input id="imagem" type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            convertFileToBase64(file).then(({ base64 }) => {
                              field.onChange(base64);
                              setImageName({ name: file.name });
                            });
                          }
                        }} />
                      </Label>
                    </FormControl>

                    <FormMessage />
                  </CardContent>
                </Card>
              </FormItem>
            )}
          />

        </form>

        <div className="absolute bottom-0 left-0 w-full p-3 bg-background">
          <Button className="h-14 w-full" onClick={form.handleSubmit(handleSubmit)}>
            <SendIcon />
            ENVIAR AVARIA
          </Button>
        </div>
      </Form>
    </div>
  )
}