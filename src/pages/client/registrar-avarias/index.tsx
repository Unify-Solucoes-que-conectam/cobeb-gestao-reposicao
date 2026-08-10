import { CameraModal } from "@/components/custom/camera-modal";
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
import { Avaria, Cliente, NotaFiscal, TiposAvaria } from "@/types/consults";
import { formatCurrency } from "@/utils/formatters";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangleIcon, CameraIcon, CheckIcon, FileTextIcon, MinusIcon, NotepadTextIcon, PackageIcon, PackageXIcon, PlusIcon, SendIcon, TriangleAlertIcon, XIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "react-router";
import { toast } from "sonner";
import { CadastrarAvariaSchema, initValues, schema } from "./schemas/avaria";

export default function ClientRegistrarAvarias() {

  // ===================================== Hooks ====================================
  const { setPageTitle, setPageDescription, setShowBackButton, setShowLogoutButton } = useHeader()
  const { user } = useAuth()
  const location = useLocation()
  const clienteInfo = location.state?.cliente as Cliente | undefined
  const avariasCache = location.state?.avarias as Avaria[] | undefined

  // ===================== Formulário de cadastro de avarias =======================
  const form = useForm<CadastrarAvariaSchema>({
    resolver: zodResolver(schema),
    defaultValues: initValues,
    mode: "onSubmit"
  })

  // =============================== States de dados ===============================
  const [tiposAvaria, setTiposAvaria] = useState<TiposAvaria[]>([]);
  const [cliente, setCliente] = useState<Cliente | undefined>(clienteInfo)
  const [avarias, setAvarias] = useState<Avaria[]>(avariasCache || [])
  const [anexos, setAnexos] = useState<{ id: string; name: string; base64: string }[]>([]);
  const [avariasPendentes, setAvariasPendentes] = useState<Avaria[]>([]);


  // =============================== States de controle =============================
  const [progress, setProgress] = useState<string[]>([]);
  const [spinners, setSpinners] = useState({
    enviando: false,
  });
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [viewingImage, setViewingImage] = useState<{ id: string; name: string; base64: string } | null>(null);

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

      // consulta avarias novamente para atualizar a lista de avarias do cliente
      fetchAvarias();
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
   * Consultar avarias do cliente selecionado, filtrando por status (opcional)
   */
  const fetchAvarias = async ({ signal, status }: { signal?: AbortSignal; status?: string } = {}) => {
    const response = await clienteService.avarias({ id: cliente?.id || '', status: status === 'todos' ? undefined : status }, signal);

    if (response.success) {
      setAvarias(response.data);
      setAvariasPendentes(response.data.filter(a => a.status === 'pendente'));
    } else {
      toast.error(response.message || 'Erro ao consultar avarias');
    }
  }

  /**
   * função para enviar a avaria
   */
  const handleEnviar = async () => {
    setSpinners(prev => ({ ...prev, enviando: true }));

    setProgress([]);

    for (const avaria of avariasPendentes) {
      const response = await avariaService.enviar(avaria.id);

      if (response.success) {
        setProgress(prev => [...prev, avaria.id]);
      }
    }

    toast.success('Todas as avarias foram enviadas com sucesso!');
    setProgress([]);
    setSpinners(prev => ({ ...prev, enviando: false }));
    fetchAvarias();
  };

  /**
   * useEffect a ser disparado ao carregar página
   */
  useEffect(() => {
    fetchTiposAvaria();
    setShowBackButton(true)
    setShowLogoutButton(false)

    if (cliente) {
      setPageTitle(cliente.razao_social || 'Registrar Avarias')
      setPageDescription(`Cód: ${cliente.codigo} • ${cliente.endereco}`)
    } else {
      // Fallback de segurança: se o usuário recarregar a página (F5), ou acessar a URL direto
      setPageTitle('Registrar Avarias')
      setPageDescription('Carregando informações...')

      if (clienteInfo?.id) getClientDetails()
    }

    if (!avariasCache?.length) {
      fetchAvarias()
    } else {
      setAvariasPendentes(avariasCache.filter(a => a.status === 'pendente'));
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

    if (produtoEncontrado && produtoEncontrado.quantidade === 0) {
      toast.warning('Não há unidades disponíveis deste produto na nota fiscal. Verifique se o produto já foi registrado como avariado anteriormente.');
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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col gap-4 pb-35">

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
                          <CardHeader className="p-0 w-full">
                            <CardTitle
                              title={produtoEncontrado.descricao}
                              className="text-md flex items-center justify-between"
                            >
                              <span>{produtoEncontrado.descricao}</span>
                              <span className="text-primary">{formatCurrency(parseFloat(produtoEncontrado.valor_total) / (produtoEncontrado.quantidade === 0 ? produtoEncontrado.quantidade_avariada ?? 0 : produtoEncontrado.quantidade))}</span>
                            </CardTitle>
                            <CardDescription className="flex justify-between">
                              <span>Código: <strong>#{produtoEncontrado.codigo}</strong></span>
                              <span>Unidades: {produtoEncontrado.quantidade}</span>
                            </CardDescription>
                          </CardHeader>
                          {
                            produtoEncontrado.quantidade_avariada && produtoEncontrado.quantidade_avariada > 0 ? (
                              <CardContent className="p-0 pt-2 border-t text-xs flex justify-between items-center text-amber-600">
                                <div className="flex items-center gap-2">
                                  <PackageXIcon size={20} />
                                  <span>{produtoEncontrado.quantidade_avariada} {produtoEncontrado.quantidade_avariada === 1 ? 'item avariado' : 'itens avariados'}</span>
                                </div>

                                <AlertTriangleIcon size={20} />
                              </CardContent>
                            ) : null
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

                  <StepOverlay disabled={!produtoEncontrado || produtoEncontrado.quantidade === 0} />
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

              const handleRemoverAnexo = (idParaRemover: string) => {
                const anexosAtualizados = anexos.filter(anexo => anexo.id !== idParaRemover);
                setAnexos(anexosAtualizados);
                field.onChange(anexosAtualizados.map(item => ({
                  nome: item.name,
                  base64: item.base64
                })));
              };

              // Função disparada quando a foto é tirada dentro do HTML5 Camera Modal
              const handleCapturePhoto = (base64Image: string) => {
                const timestamp = Date.now();
                const novoAnexo = {
                  id: `${timestamp}`,
                  name: `Avaria_${anexos.length + 1}.jpg`,
                  base64: base64Image
                };

                const estadoAtualizado = [...anexos, novoAnexo];

                setAnexos(estadoAtualizado);
                field.onChange(estadoAtualizado.map(item => ({
                  nome: item.name,
                  base64: item.base64
                })));

                setIsCameraOpen(false); // Fecha a câmera após tirar a foto
                toast.success("Foto capturada com sucesso!");
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
                        <div className='flex flex-col gap-3'>

                          {/* LISTA DE ANEXOS */}
                          {anexos.map((anexo, index) => (
                            <Card key={anexo.id} className="flex items-center p-3 gap-3 relative">
                              {/* Thumbnail clicável da imagem */}
                              <div
                                className="flex items-center justify-center border rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                                onClick={() => setViewingImage(anexo)}
                              >
                                <img
                                  src={anexo.base64}
                                  alt={`Anexo ${index + 1}`}
                                  className="w-16 h-16 object-cover"
                                />
                              </div>
                              <CardHeader
                                className="p-0 flex-1 overflow-hidden cursor-pointer w-32"
                                onClick={() => setViewingImage(anexo)}
                              >
                                <CardTitle className="font-bold text-xl m-0 text-emerald-700 truncate">
                                  Anexo {index + 1}
                                </CardTitle>
                                <CardDescription className="font-thin text-gray-400 truncate">
                                  {anexo.name}
                                </CardDescription>
                              </CardHeader>

                              <Button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoverAnexo(anexo.id);
                                }}
                                size='icon'
                                className="text-red-500 bg-red-50 hover:bg-red-100 transition-colors shrink-0"
                              >
                                <XIcon className="size-5" />
                              </Button>
                            </Card>
                          ))}

                          {/* BOTÃO PARA ABRIR A CÂMERA HTML5 */}
                          <Card
                            onClick={() => setIsCameraOpen(true)}
                            className="flex flex-col items-center p-3 border-dotted border-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                          >
                            <CardHeader className="p-0 items-center">
                              <CardTitle className="flex flex-col items-center font-bold text-xl m-0 text-center gap-2">
                                <CameraIcon className="text-gray-500 size-7" />
                                Tire uma foto
                              </CardTitle>
                              <CardDescription className="font-thin text-gray-400 text-center">
                                Toque para abrir a câmera e fotografar o produto
                              </CardDescription>
                            </CardHeader>
                          </Card>

                          {/* MODAL DA CÂMERA HTML5 */}
                          <CameraModal
                            isOpen={isCameraOpen}
                            onClose={() => setIsCameraOpen(false)}
                            onCapture={handleCapturePhoto}
                          />

                          {/* MODAL DE VISUALIZAÇÃO DE IMAGEM */}
                          {viewingImage && (
                            <div
                              className="fixed inset-0 z-200 bg-black/95 flex flex-col items-center justify-center p-4"
                              onClick={() => setViewingImage(null)}
                            >
                              <div className="w-full flex justify-between items-center text-white mb-4">
                                <div className="flex flex-col">
                                  <span className="font-semibold text-lg">Visualização da imagem</span>
                                  <span className="text-sm text-gray-400">{viewingImage.name}</span>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setViewingImage(null)}
                                  className="text-white hover:bg-white/20 rounded-full"
                                >
                                  <XIcon size={24} />
                                </Button>
                              </div>
                              <div className="w-full h-full flex items-center justify-center">
                                <img
                                  src={viewingImage.base64}
                                  alt="Visualização em tela cheia"
                                  className="max-w-full max-h-full object-contain rounded-lg"
                                  onClick={(e) => e.stopPropagation()}
                                />
                              </div>
                              <p className="text-white text-sm mt-4 opacity-70">Toque fora da imagem para fechar</p>
                            </div>
                          )}

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

        <div className="absolute bottom-0 left-0 w-full p-3 bg-background z-50 flex flex-col gap-2">
          <Button className="h-14 w-full" disabled={!form.formState.isValid || form.formState.isSubmitting} loading={form.formState.isSubmitting} onClick={form.handleSubmit(handleSubmit)}>
            {!form.formState.isSubmitting && <NotepadTextIcon className="mr-2" />}
            {form.formState.isSubmitting ? 'Registrando Avaria...' : 'Registrar Avaria'}
          </Button>
          <Button variant="outline" type="button" className="relative h-14 w-full" disabled={form.formState.isSubmitting || spinners.enviando || avarias.filter(a => a.status === 'pendente').length === 0} loading={spinners.enviando} onClick={handleEnviar}>
            {!spinners.enviando && <SendIcon className="mr-2" />}
            {spinners.enviando ? 'Enviando avarias registradas...' : `Enviar avarias registradas (${avariasPendentes.length})`}

            {/* PROGRESS LAYER (calcula a porcentagem de avarias pendentes) */}
            <div
              className="absolute left-0 top-0 bg-blue-500/30 animate-pulse h-full rounded-md transition-all duration-300"
              style={{
                width: `${avariasPendentes.length > 0 ? (progress.length / avariasPendentes.length) * 100 : 0}%`
              }}
            ></div>
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