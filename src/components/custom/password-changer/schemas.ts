import { z } from 'zod'

export const schema = z.object({
  id: z.string(),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmar_senha: z.string().min(6, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
})

export type Schema = z.infer<typeof schema>