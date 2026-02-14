import { NotificationType } from "@/hooks/use-echo";

export type User = {
  id: string;
  cpf: string;
  nome: string;
  role: 'monitoramento' | 'motorista';
  first_access: boolean;
}

export type Notification = {
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