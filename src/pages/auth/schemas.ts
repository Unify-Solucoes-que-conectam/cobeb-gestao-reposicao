import { z } from 'zod'

export const schema = z.object({
  name: z.string().min(1, 'O nome é obrigatório'),
  cpf: z.string().min(1, 'O CPF é obrigatório'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export type Schema = z.infer<typeof schema>

export const defaultValues: Schema = {
  name: '',
  cpf: '',
  password: '',
}
