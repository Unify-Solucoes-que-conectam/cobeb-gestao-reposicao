import { z } from 'zod'

export const schema = (registering?: boolean) => z.object({
  nome: z.string().optional(),
  cpf: 
    z.string().min(1, 'O CPF é obrigatório'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
}).refine(
  (data) => {
    if (registering) {
      return !!data.nome && data.nome.split(' ').length > 0
    }
    return true
  },
  {
    message: 'O nome é obrigatório',
    path: ['nome'],
  }
)

export type Schema = z.infer<ReturnType<typeof schema>>

export const defaultValues: Schema = {
  nome: '',
  cpf: '',
  senha: '',
}
