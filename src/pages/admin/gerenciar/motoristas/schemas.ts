import { Motorista } from '@/types/consults';
import { z } from 'zod';

export const schema = z.object({
  codigo: z.string().min(1, 'O código é obrigatório'),
  nome: z.string().min(1, 'O nome é obrigatório'),
  cpf: z.string().min(1, 'O CPF é obrigatório').refine(
    (cpf) => /^\d{11}$/.test(cpf),
    {
      message: 'CPF deve conter exatamente 11 dígitos numéricos',
    }
  ),
  status: z.enum(['ativo', 'inativo'], {
    message: 'O status é obrigatório',
  }),
  celular_corporativo: z.string().min(1, 'O celular corporativo é obrigatório').refine(
    (celular) => /^(55)?(?:([1-9]{2})?)(\d{4,5})(\d{4})$/.test(celular),
    {
      message: 'Número de celular inválido',
    }
  ),
  data_admissao: z.string().min(1, 'A data de admissão é obrigatória'),
  filial_id: z.string().min(1, 'A filial é obrigatória'),
  cluster_id: z.string().min(1, 'O cluster é obrigatório'),
})

export type Schema = z.infer<typeof schema>;

export const defaultValues = (data?: Motorista): Schema => ({
  codigo: data?.codigo || '',
  nome: data?.nome || '',
  cpf: data?.cpf || '',
  status: data?.status || 'ativo',
  celular_corporativo: data?.celular_corporativo || '',
  data_admissao: data?.data_admissao || '',
  filial_id: data?.filial.id || '',
  cluster_id: data?.cluster.id || '',
})