import { NotificationType } from "@/hooks/use-echo";
import { Filial, Mapa } from "./consults";

export type Usuario = {
  id: string;
  nome: string;
  cpf: string;
  role: 'administrador' | 'monitoramento' | 'motorista';
  primeiro_acesso: boolean;
  grupo?: { id: string; nome: string; perfil: Usuario['role'] } | null;
  acesso_geral?: boolean;
  motorista: {
    id: string
    codigo: string
    status: string
    data_admissao: string
    data_inativacao: string | null
    /** rota em andamento (null quando não há ou já foi encerrada às 00h) */
    mapa: Mapa | null
    filial: Filial
  }
}

/** Tenant = filial em que o usuário está conectado. "geral" dá acesso a todas. */
export type Tenant = {
  id: string // 'geral' ou id da filial
  nome: string
  codigo: string | null
  geral: boolean
}

/** Chaves das ações liberadas por grupo (catálogo em config/permissoes.php da API). */
export type Permissao =
  | 'avarias.registrar'
  | 'avarias.aprovar'
  | 'avarias.editar_quantidade'
  | 'avarias.reenviar_whatsapp'
  | 'importacoes.importar'
  | 'mapas.designar_motorista'
  | 'mapas.alterar_clientes'
  | 'motoristas.gerenciar'
  | 'trocas.exportar'
  | 'usuarios.gerenciar'
  | 'whatsapp.gerenciar'
  | 'permissoes.gerenciar'

export type Sessao = {
  usuario: Usuario
  menus: Menu[]
  permissoes: Permissao[]
  tenants: Tenant[]
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
  required_role?: Usuario['role'] | null
}

export type Base = {
  id: string
  created_at: string
  updated_at: string
}
