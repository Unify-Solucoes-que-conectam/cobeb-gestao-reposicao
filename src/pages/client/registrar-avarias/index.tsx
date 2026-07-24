import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useHeader } from "@/hooks/mobile/use-header";
import { useAuth } from "@/hooks/use-auth";
import { useDebounce } from "@/hooks/use-debounce";
import axios from "@/lib/axios";
import { avariaService, clienteService, tiposAvariaService } from "@/services/api.service";
import { ApiResponse } from "@/types/api-response";
import { Cliente, NotaFiscal, TiposAvaria } from "@/types/consults";
import { convertFileToBase64 } from "@/utils/conversors";
import { formatCurrency } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, CameraIcon, CheckIcon, FileTextIcon, ImageIcon, MinusIcon, NotepadTextIcon, PackageIcon, PackageXIcon, PlusIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CadastrarAvariaSchema, initValues, schema } from "./schemas/avaria";

export default function ClientRegistrarAvarias() {

  // ===================================== Hooks ====================================
  const { setPageTitle, setPageDescription, setShowBackButton } = useHeader()
  const { user } = useAuth()
  const location = useLocation()
  const clienteInfo = location.state?.cliente as Cliente | undefined

  // ===================== Formulário de cadastro de avarias =======================
  const form = useForm<CadastrarAvariaSchema>({
    resolver: zodResolver(schema),
    defaultValues: initValues,
    mode: "onSubmit"
  })

  // =============================== States de dados ===============================
  const [tiposAvaria, setTiposAvaria] = useState<TiposAvaria[]>([]);
  const [cliente, setCliente] = useState<Cliente | undefined>(clienteInfo)
  const [anexos, setAnexos] = useState<{ id: string; name: string; base64: string }[]>([]);

  // =============================== States de passos ===============================
  const [notaFiscalData, setNotaFiscalData] = useState<NotaFiscal | null>(null);

  /**
   * Função para buscar detalhes do cliente caso o usuário recarregue a página (F5) ou acesse a URL direto
   */
  const getClientDetails = async () => {
    try {
      const res = await axios.get<ApiResponse<Cliente>>(`/clientes/${clienteInfo?.id}`, {
        params: {
          detalhar: true,
        },
      })

      const { data } = res.data

      if (res.data.success) {
        setCliente(data)
      }
    } catch (err) {
      toast.error(
        'Erro ao buscar detalhes do cliente. Contate o administrador do sistema caso o erro persista!'
      )
      console.error('Erro ao buscar detalhes do cliente', err)
    }
  }

  /**
   * função para registrar avarias
   */
  const handleSubmit = async (data: CadastrarAvariaSchema) => {

    const response = await avariaService.create({
      cliente_id: cliente?.id || '',
      motorista_id: user?.motorista.id || '',
      produtos: notaFiscalData?.produtos.filter(produto => produto.codigo === data.produto || produto.ean === data.produto).map(produto => ({
        produto_id: produto.id,
        tipo_avaria_id: data.tipo_avaria,
        quantidade: data.quantidade_avariada,
      })).filter(Boolean) || [],
      anexos: data.anexos
    })

    if (response.success) {
      toast.success('Avaria registrada com sucesso!');
      form.reset({
        nota_fiscal: notaFiscalData?.numero,
        produto: '',
        tipo_avaria: '',
        quantidade_avariada: 0,
        anexos: []
      })
      setAnexos([]);

      // consulta notas fiscais novamente para atualizar a quantidade de produtos disponíveis
      notaFiscalDebounced(notaFiscalWatcher);
    } else {
      toast.error(response.message || 'Erro ao registrar avaria');
    }
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
    setShowBackButton(true)

    if (cliente) {
      setPageTitle(cliente.razao_social || 'Registrar Avarias')
      setPageDescription(`Cód: ${cliente.codigo} • ${cliente.endereco}`)
    } else {
      // Fallback de segurança: se o usuário recarregar a página (F5), ou acessar a URL direto
      setPageTitle('Registrar Avarias')
      setPageDescription('Carregando informações...')

      if (clienteInfo?.id) getClientDetails()
    }
  }, [setPageTitle, setPageDescription, cliente]);

  // =================================== Watchers ==================================
  const notaFiscalWatcher = form.watch('nota_fiscal');
  const produtoWatcher = form.watch('produto');
  const tipoAvariaWatcher = form.watch('tipo_avaria');
  const quantidadeAvariadaWatcher = form.watch('quantidade_avariada');

  /**
   * useDebounce para consultar nota fiscal
   */
  const notaFiscalDebounced = useDebounce(async (numeroNota: string) => {
    // Se o campo estiver vazio, apenas limpa os estados e o próprio campo sem disparar resets em loop
    if (!numeroNota || numeroNota.trim() === "") {
      setNotaFiscalData(null);
      form.reset({
        nota_fiscal: "",
        produto: "",
        tipo_avaria: "",
        quantidade_avariada: 0,
        anexos: []
      });
      setAnexos([]);
      return;
    }

    try {
      const response = await clienteService.notaFiscal({ id: cliente!.id, search: numeroNota });
      const notaFiscal = response.data;

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
      setNotaFiscalData(null);
      form.setError('nota_fiscal', {
        type: 'manual',
        message: 'Nota Fiscal não encontrada.'
      });
    }
  }, 800);

  /**
   * Verifica se o produto informado está presente na nota fiscal
   */
  const produtoEncontrado = notaFiscalData?.produtos.find(produto => produto.codigo === form.getValues('produto') || produto.ean === form.getValues('produto'));

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
   * função para calcular o valor de todos os produtos na nota
   */
  const calculateTotalValue = (nota: NotaFiscal) => {
    let total = 0

    nota.produtos.forEach((produto) => {
      total += parseFloat(produto.valor_total)
    })

    return total
  }

  /**
   * useEffect para disparar a consulta da nota fiscal quando o campo for alterado
   */
  useEffect(() => {
    notaFiscalDebounced(notaFiscalWatcher);
  }, [notaFiscalWatcher]);

  /**
   * useEffect para disparar a consulta do produto quando o campo for alterado e a nota fiscal estiver carregada
   */
  useEffect(() => {
    if (notaFiscalData) {
      produtoDebounced();
    }
  }, [produtoWatcher, notaFiscalData]);

  /**
   * useEffect para captar qualquer alteração nos campos do formulário
   */
  useEffect(() => {
    let timer: NodeJS.Timeout;

    // Função auxiliar para agilizar o foco
    const delayFocus = (fieldName: "produto") => {
      timer = setTimeout(() => {
        form.setFocus(fieldName);
      }, 100); // 100ms é o suficiente para não travar a UI
    };

    if (notaFiscalData !== null) {
      delayFocus('produto');
    }

    // Função de limpeza real do useEffect
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [notaFiscalData]);

  return (
    <div className="flex flex-col w-full h-full bg-slate-50 overflow-y-auto no-scrollbar">

      <StepPanel steps={[
        { step: 1, active: notaFiscalData !== null },
        { step: 2, active: !!produtoEncontrado },
        { step: 3, active: tipoAvariaWatcher !== '' },
        { step: 4, active: quantidadeAvariadaWatcher > 0 },
        { step: 5, active: form.formState.isValid }
      ]} />

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
                        <Card className="w-full p-3">
                          <CardHeader className="p-0 pb-2 border-b">
                            <CardTitle className="flex justify-between items-center text-lg m-0">
                              NF {notaFiscalData.numero}
                              <span className="text-primary">{formatCurrency(calculateTotalValue(notaFiscalData))}</span>
                            </CardTitle>
                            <CardDescription className="m-0">
                              Pedido: <strong>#{notaFiscalData.pedido}</strong>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-0 pt-2 text-xs text-gray-500 flex items-center gap-2">
                            <PackageIcon size={20} />
                            <span>{notaFiscalData.produtos.length} {notaFiscalData.produtos.length === 1 ? 'item encontrado' : 'itens encontrados'}</span>
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
                <Card className="relative">
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
                          disabled={notaFiscalData === null}
                          placeholder="Ex: 7001"
                        />
                        <InputGroupAddon>
                          <PackageIcon />
                        </InputGroupAddon>
                      </InputGroup>
                    </FormControl>

                    <FormMessage />
                  </CardContent>

                  {
                    produtoEncontrado && (
                      <CardFooter className="p-2">
                        <Card className="p-3 w-full">
                          <CardHeader className="p-0 w-full border-b pb-2">
                            <CardTitle
                              title={produtoEncontrado.descricao}
                              className="text-md flex items-center justify-between"
                            >
                              <span>{produtoEncontrado.descricao}</span>
                              <span className="text-primary">{formatCurrency(parseFloat(produtoEncontrado.valor_total) / produtoEncontrado.quantidade)}</span>
                            </CardTitle>
                            <CardDescription className="flex justify-between">
                              <span>Código: <strong>#{produtoEncontrado.codigo}</strong></span>
                              <span>Unidades: {produtoEncontrado.quantidade}</span>
                            </CardDescription>
                          </CardHeader>
                          {
                            produtoEncontrado.quantidade_avariada && (
                              <CardContent className="p-0 pt-2 text-xs flex justify-between items-center text-amber-600">
                                <div className="flex items-center gap-2">
                                  <PackageXIcon size={20} />
                                  <span>{produtoEncontrado.quantidade_avariada} {produtoEncontrado.quantidade_avariada === 1 ? 'item avariado' : 'itens avariados'}</span>
                                </div>

                                <AlertTriangleIcon size={20} />
                              </CardContent>
                            )
                          }
                        </Card>
                      </CardFooter>
                    )
                  }

                  <StepOverlay disabled={notaFiscalData === null} />
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
                <Card className="relative">
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
                                  <RadioGroupItem disabled={!produtoEncontrado} value={tipo.id} id={tipo.id} />
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

                  <StepOverlay disabled={!produtoEncontrado} />
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
                <Card className="relative">
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
                            // Exibe vazio se for 0/null/undefined para não travar o "0" visualmente ao digitar
                            value={field.value || ''}
                            placeholder="0"
                            min={0}
                            max={produtoEncontrado?.quantidade ?? 999}
                            onChange={(e) => {
                              const raw = e.target.value;

                              // Permite apagar o campo sem forçar o 0 de imediato
                              if (raw === '') {
                                field.onChange('');
                                return;
                              }

                              const max = produtoEncontrado?.quantidade;
                              const parsed = Math.max(0, parseInt(raw, 10) || 0);

                              // Aplica o limite máximo se houver produto carregado
                              field.onChange(max !== undefined && parsed > max ? max : parsed);
                            }}
                            onBlur={() => {
                              // Ao sair do campo vazio ou inválido, garante que o valor volte a ser 0
                              if (!field.value || field.value < 0) {
                                field.onChange(0);
                              }
                            }}
                            className="text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            disabled={!tipoAvariaWatcher}
                          />
                          <Button variant="outline" type="button" className="flex-1 text-blue-700 bg-blue-500/20" disabled={(field.value || 0) >= (produtoEncontrado?.quantidade ?? 999) || !tipoAvariaWatcher} onClick={() => field.onChange(Math.min((field.value || 0) + 1, produtoEncontrado?.quantidade ?? 999))}>
                            <PlusIcon />
                          </Button>
                        </div>
                        <Button type="button" className="flex-1" disabled={!tipoAvariaWatcher} onClick={() => field.onChange(produtoEncontrado?.quantidade ?? 999)}>
                          SELECIONAR TUDO
                        </Button>
                      </div>
                    </FormControl>

                    <FormMessage />
                  </CardContent>

                  <StepOverlay disabled={tipoAvariaWatcher === ''} />
                </Card>
              </FormItem>
            )}
          />

          {/* ALERTA_IMAGEM */}
          <Card className="relative flex items-center px-1 py-2 border-dotted border-2 border-amber-700 bg-amber-100">
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

            <StepOverlay disabled={!quantidadeAvariadaWatcher && quantidadeAvariadaWatcher === 0} />
          </Card>

          {/* IMAGEM_FIELD */}
          <FormField
            control={form.control}
            name='anexos'
            render={({ field }) => {

              // Função para remover a imagem e sincronizar os estados
              const handleRemoverAnexo = (idParaRemover: string) => {
                // Filtra tirando o anexo que tem o id clicado
                const anexosAtualizados = anexos.filter(anexo => anexo.id !== idParaRemover);

                // Atualiza o estado visual
                setAnexos(anexosAtualizados);

                // Atualiza o envio do formulário apenas com os base64 que sobraram
                field.onChange(anexosAtualizados.map(item => item.base64));
              };

              return (
                <FormItem className="w-full">
                  <Card className="relative">
                    <CardHeader className="p-2">
                      <CardTitle>
                        <FormLabel className="text-blue-700 font-bold text-lg" required>
                          FOTOGRAFAR AVARIA
                        </FormLabel>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-2">
                      <FormControl>
                        {/* Substituímos o Label geral por uma div para não bugar o botão de apagar */}
                        <div className='flex flex-col gap-3'>

                          {/* 1. LISTA DE ANEXOS (Com botão de apagar) */}
                          {anexos.map((anexo, index) => (
                            <Card key={anexo.id} className="flex items-center p-3 gap-3 relative">
                              <div className="flex items-center justify-center p-3 border rounded-md">
                                <ImageIcon className="text-emerald-700 size-7" />
                              </div>
                              <CardHeader className="p-0 flex-1 overflow-hidden">
                                <CardTitle className="font-bold text-xl m-0 text-emerald-700">
                                  {/* Como usamos o 'index' do map, a numeração se reordena sozinha! */}
                                  Anexo {index + 1}
                                </CardTitle>
                                <CardDescription className="font-thin text-gray-400 truncate">
                                  {anexo.name}
                                </CardDescription>
                              </CardHeader>

                              {/* Botão de Excluir */}
                              <Button
                                type="button"
                                onClick={() => handleRemoverAnexo(anexo.id)}
                                size='icon'
                                className="text-red-500 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                              >
                                <XIcon className="size-5" /> {/* Se não tiver esse ícone, pode usar X ou Trash2 */}
                              </Button>
                            </Card>
                          ))}

                          {/* 2. BOTÃO DE ADICIONAR (Este sim fica dentro do Label para abrir a câmera) */}
                          <Label htmlFor="anexos" className="flex flex-col w-full">
                            <input
                              id="anexos"
                              type="file"
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                const fileArray = Array.from(files);

                                const base64Results = await Promise.all(
                                  fileArray.map(file => convertFileToBase64(file))
                                );

                                // Usar Date.now() previne que IDs se repitam ao apagar e adicionar fotos
                                const timestamp = Date.now();
                                const novosAnexos = base64Results.map(({ base64 }, index) => {
                                  const arquivoOriginal = fileArray[index];
                                  return {
                                    id: `${timestamp}-${index}`,
                                    name: arquivoOriginal.name || `Imagem_${index + 1}.jpg`,
                                    base64: base64
                                  };
                                });

                                const estadoAtualizado = [...anexos, ...novosAnexos];

                                setAnexos(estadoAtualizado);
                                field.onChange(estadoAtualizado.map(item => ({
                                  nome: item.name,
                                  base64: item.base64
                                })));

                                // Limpa o input para caso o usuário apague uma foto e tente enviar a exata mesma foto logo em seguida
                                e.target.value = '';
                              }}
                            />
                            <Card className="flex flex-col items-center p-3 border-dotted border-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition">
                              <CardHeader className="p-0 items-center">
                                <CardTitle className="flex flex-col items-center font-bold text-xl m-0 text-center gap-2">
                                  <CameraIcon className="text-gray-500 size-7" />
                                  Tire uma foto
                                </CardTitle>
                                <CardDescription className="font-thin text-gray-400 text-center">
                                  Toque para tirar a foto do(s) produto(s) avariado(s)
                                </CardDescription>
                              </CardHeader>
                            </Card>
                          </Label>

                        </div>
                      </FormControl>
                      <FormMessage />
                    </CardContent>
                    <StepOverlay disabled={quantidadeAvariadaWatcher === 0} />
                  </Card>
                </FormItem>
              );
            }}
          />

        </form>

        <div className="absolute bottom-0 left-0 w-full p-3 bg-background z-50">
          <Button className="h-14 w-full" disabled={!form.formState.isValid} onClick={form.handleSubmit(handleSubmit)}>
            <NotepadTextIcon />
            REGISTRAR AVARIA
          </Button>
        </div>
      </Form>
    </div>
  )
}

const StepOverlay = ({ disabled }: { disabled: boolean }) => {

  if (!disabled) {
    return null
  }

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-gray-100/70 z-10 flex items-center justify-center rounded-md"></div>
  )
}

const StepPanel = ({ steps }: { steps: Array<{ step: number, active: boolean }> }) => {
  return (
    <div className="px-3 pb-3 bg-background sticky w-full top-0 left-0 flex gap-2 z-50">
      {
        steps.map((step, index) => (
          <div key={index} className={`h-3 rounded-full w-full ${step.active ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
        ))
      }
    </div>
  )
}