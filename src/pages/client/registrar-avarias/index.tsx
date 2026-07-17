import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { fetch } from "@/services/fetch";
import { TiposAvaria } from "@/types/consults";
import { convertFileToBase64 } from "@/utils/conversors";
import { zodResolver } from "@hookform/resolvers/zod";
import { CameraIcon, FileTextIcon, ImageIcon, MinusIcon, PlusIcon, SendIcon, TriangleAlertIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { CadastrarAvariaSchema, initValues, schema } from "./schemas/avaria";

export default function ClientRegistrarAvarias() {

  // ===================== Formulário de cadastro de avarias =====================
  const form = useForm<CadastrarAvariaSchema>({
    resolver: zodResolver(schema),
    defaultValues: initValues,
    mode: "onSubmit"
  })

  // =============================== States de dados =============================
  const [tiposAvaria, setTiposAvaria] = useState<TiposAvaria[]>([]);
  const [imageName, setImageName] = useState<{
    name: string;
  } | null>(null);

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
    const response = await fetch.tiposAvaria();

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
                    <CardTitle>
                      <FormLabel className="text-blue-700 font-bold text-lg" required>NOTA FISCAL</FormLabel>
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
                </Card>
              </FormItem>
            )}
          />

          {/* CODIGO_PRODUTO_FIELD */}
          <FormField
            control={form.control}
            name='produto'
            render={({ field }) => (
              <FormItem className="w-full">
                <Card>
                  <CardHeader className="p-2">
                    <CardTitle>
                      <FormLabel className="text-blue-700 font-bold text-lg" required>CÓDIGO DO PRODUTO</FormLabel>
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
                          <Button variant="outline" type="button" className="flex-1 text-blue-700 bg-blue-500/20" onClick={() => field.onChange((field.value || 0) - 1)}>
                            <MinusIcon />
                          </Button>
                          <Input
                            type="number"
                            value={field.value ?? 0}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            min={0}
                            className="text-center flex-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <Button variant="outline" type="button" className="flex-1 text-blue-700 bg-blue-500/20" onClick={() => field.onChange(field.value + 1)}>
                            <PlusIcon />
                          </Button>
                        </div>
                        <Button type="button" className="flex-1" onClick={() => field.onChange(999)}>
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