import axios from '@/lib/axios'
import type { ApiResponse } from '@/types/api-response'
import type { Permissao, Usuario } from '@/types/app'

export type Perfil = Usuario['role']

export type Acao = { chave: Permissao; modulo: string; descricao: string }

export type MenuCatalogo = { id: string; titulo: string; sub_menus: { id: string; titulo: string }[] }

export type FilialResumo = { id: string; codigo: string; descricao: string }

export type Catalogo = {
  acoes: Acao[]
  menus: MenuCatalogo[]
  filiais: FilialResumo[]
  perfis: Perfil[]
}

export type Grupo = {
  id: string
  nome: string
  descricao: string | null
  perfil: Perfil
  sistema: boolean
  usuarios_count: number
  menus: string[]
  permissoes: Permissao[]
}

export type GrupoPayload = Pick<Grupo, 'nome' | 'descricao' | 'perfil' | 'menus' | 'permissoes'>

export type UsuarioAcesso = {
  id: string
  nome: string
  cpf: string
  role: Perfil
  grupo: { id: string; nome: string; perfil: Perfil } | null
  acesso_geral: boolean
  filiais: FilialResumo[]
}

export type UsuarioAcessoPayload = { grupo_id: string; acesso_geral: boolean; filiais: string[] }

export const PERFIL_LABEL: Record<Perfil, string> = {
  administrador: 'Administrador',
  monitoramento: 'Monitoramento',
  motorista: 'Motorista (app)',
}

/** Primeira mensagem de erro de validação da API. */
export const mensagemErro = (response: ApiResponse & { errors?: Record<string, string[]> }, padrao: string) =>
  Object.values(response.errors ?? {})[0]?.[0] ?? response.message ?? padrao

export const permissoesService = {
  catalogo: async () => (await axios.get<ApiResponse<Catalogo>>('/permissoes/catalogo')).data,

  grupos: async () => (await axios.get<ApiResponse<Grupo[]>>('/permissoes/grupos')).data,

  salvarGrupo: async (payload: GrupoPayload, id?: string) =>
    (id
      ? await axios.put<ApiResponse<Grupo>>(`/permissoes/grupos/${id}`, payload)
      : await axios.post<ApiResponse<Grupo>>('/permissoes/grupos', payload)
    ).data,

  excluirGrupo: async (id: string) => (await axios.delete<ApiResponse>(`/permissoes/grupos/${id}`)).data,

  usuarios: async (params: { search?: string; grupo?: string }) =>
    (await axios.get<ApiResponse<UsuarioAcesso[]>>('/permissoes/usuarios', { params })).data,

  salvarUsuario: async (id: string, payload: UsuarioAcessoPayload) =>
    (await axios.put<ApiResponse<UsuarioAcesso>>(`/permissoes/usuarios/${id}`, payload)).data,
}
