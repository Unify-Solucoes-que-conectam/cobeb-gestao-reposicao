import { z } from 'zod';

export const schema = (editing?: boolean) => z.object({
  tipo: z.enum(['monitoramento', 'motorista'], {
    message: 'O tipo é obrigatório',
  }),
  cpf: z.string().min(1, 'O CPF é obrigatório').refine(
    (cpf) => /^\d{11}$/.test(cpf),
    {
      message: 'CPF deve conter exatamente 11 dígitos numéricos',
    }
  ),
  nome: z.string().min(1, 'O nome é obrigatório'),
  senha: z.string().optional(),
  confirmar_senha: z.string().optional(),
}).refine(
  (data) => {
    if (!editing) {
      return !!data.senha && data.senha.trim().length > 0
    }
    return true
  },
  {
    message: 'A senha é obrigatória',
    path: ['senha'],
  }
).refine(
  (data) => {
    if (!editing) {
      return !!data.confirmar_senha && data.confirmar_senha.trim().length > 0
    }
    return true
  },
  {
    message: 'A confirmação de senha é obrigatória',
    path: ['confirmar_senha'],
  }
)

export type Schema = z.infer<ReturnType<typeof schema>>;

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