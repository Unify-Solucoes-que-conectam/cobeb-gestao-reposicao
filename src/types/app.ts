import { NotificationType } from "@/hooks/use-echo";

export type Usuario = {
  id: string;
  cpf: string;
  nome: string;
  role: 'monitoramento' | 'motorista';
  primeiro_acesso: boolean;
}

export type Notificacao = {
  id: string
  titulo: string
  mensagem: string
  tipo: NotificationType
  link: string | null
  data_envio: string
  lida: boolean
}

export type Menu = Base & {
  titulo: string
  icone: string
  rota: string
  ordem: number
  sub_menus: Menu[]
}

export type Base = {
  id: string
  created_at: string
  updated_at: string
}