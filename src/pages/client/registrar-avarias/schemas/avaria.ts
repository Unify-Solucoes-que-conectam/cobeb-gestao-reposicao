import z from "zod";

export const schema = z.object({
  nota_fiscal: z.string().min(1, 'Nota Fiscal é obrigatória'),
  produto: z.string().min(1, 'Produto é obrigatório'),
  tipo_avaria: z.string().min(1, 'Tipo de Avaria é obrigatório'),
  quantidade_avariada: z.number().min(1, 'Quantidade avariada é obrigatória'),
  imagem: z.string().min(1, 'Imagem é obrigatória'),
})

export type CadastrarAvariaSchema = z.infer<typeof schema>

export const initValues: CadastrarAvariaSchema = {
  nota_fiscal: '',
  produto: '',
  tipo_avaria: '',
  quantidade_avariada: 0,
  imagem: '',
}