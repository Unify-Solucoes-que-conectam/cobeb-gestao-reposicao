import { NotificationType } from "@/hooks/use-echo";

export type User = {
  id: string;
  cpf: string;
  name: string;
  role: 'monitoramento' | 'motorista';
  first_access: boolean;
}

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  link: string | null
  sent_at: string
  read: boolean
}
