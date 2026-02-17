import { z } from 'zod'

export const schema = z.object({
  tipo: z.enum(['monitoramento', 'motorista'], {
    message: 'O tipo é obrigatório',
  }),
  cpf: z.string().optional(),
  nome: z.string().min(1, 'O nome é obrigatório'),
  senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmar_senha: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

export type Schema = z.infer<typeof schema>

export const password_validations = (
  senha: string,
  confirmar_senha: string
) => [
    {
      title: 'min8',
      validation: senha.length >= 8,
      message: 'Conter no mínimo 8 caracteres',
    },
    {
      title: 'match',
      validation:
        senha === confirmar_senha &&
        senha.length > 0 &&
        confirmar_senha.length > 0,
      message: 'Ser confirmada corretamente',
    },
    {
      title: 'invalidPassword',
      validation: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        senha
      ),
      message: 'Conter letras maiúsculas, minúsculas, números e símbolos.',
    },
  ]