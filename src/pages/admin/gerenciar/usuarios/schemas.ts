import { z } from 'zod'

export const schema = z.object({
  cpf: z.string().optional(),
  nome: z.string().min(1, 'O nome é obrigatório'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type Schema = z.infer<typeof schema>

export const defaultValues = (data: Schema): Schema => {
  return {
    nome: data?.nome || '',
    cpf: data?.cpf || '',
    senha: '',
  }
}
