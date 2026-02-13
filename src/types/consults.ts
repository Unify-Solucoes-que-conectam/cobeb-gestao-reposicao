import { NotificationType } from "@/hooks/use-echo";

export type User = {
  id: string;
  cpf: string;
  nome: string;
  role: 'monitoramento' | 'motorista';
  first_access: boolean;
}

export interface Notification {
  id: string
  titulo: string
  mensagem: string
  tipo: NotificationType
  link: string | null
  data_envio: string
  lida: boolean
}
