import { createContext, useCallback, useEffect, useState, type ReactNode } from 'react'

import { toast } from 'sonner'

import axios from '@/lib/axios'
import type { Schema as SignUpSchema } from '@/pages/auth/schemas'
import { ApiResponse } from '@/types/api-response'
import { Menu, Permissao, Sessao, Tenant, Usuario } from '@/types/app'
import { resolveTenant, setTenantId } from '@/lib/tenant'
import { Schema as ChangePasswordSchema } from '@/components/custom/password-changer/schemas'
import { cacheClear } from '@/lib/offline/idb'

interface AuthState {
  user: Usuario | null
  token: string | null
  loading: boolean
  menus: Menu[],
  permissoes: Permissao[]
  tenants: Tenant[]
  tenant: Tenant | null
}

interface AuthContextType extends AuthState {
  setLoading: (loading: boolean) => void
  signIn: (cpf: string, senha: string) => Promise<{ success: boolean; message: string }>
  signUp: (signUpData: SignUpSchema) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  changePassword: (changePasswordData: ChangePasswordSchema) => Promise<{ success: boolean; message: string }>
  checkSession: () => Promise<boolean>
  refreshSession: () => Promise<void>
  /** Verifica se o grupo do usuário libera a ação. */
  can: (permissao: Permissao) => boolean
  /** Troca a filial (tenant) conectada e recarrega os dados da tela. */
  setTenant: (tenantId: string) => void
  isAuthenticated: boolean
}

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

/** Persiste os dados da sessão (login ou /auth/me). */
const persistSession = (sessao: Sessao) => {
  localStorage.setItem('user', JSON.stringify(sessao.usuario))
  localStorage.setItem('menus', JSON.stringify(sessao.menus))
  localStorage.setItem('permissoes', JSON.stringify(sessao.permissoes ?? []))
  localStorage.setItem('tenants', JSON.stringify(sessao.tenants ?? []))
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {

  const [state, setState] = useState<AuthState>(() => {
    const tenants = readJson<Tenant[]>('tenants', [])
    return {
      user: readJson<Usuario | null>('user', null),
      token: localStorage.getItem('auth_token'),
      loading: false,
      menus: readJson<Menu[]>('menus', []),
      permissoes: readJson<Permissao[]>('permissoes', []),
      tenants,
      tenant: resolveTenant(tenants),
    }
  })

  const applySession = (sessao: Sessao) => {
    persistSession(sessao)
    const tenant = resolveTenant(sessao.tenants ?? [])
    setState((prev) => ({
      ...prev,
      user: sessao.usuario,
      menus: sessao.menus,
      permissoes: sessao.permissoes ?? [],
      tenants: sessao.tenants ?? [],
      tenant,
    }))
  }

  /** Atualiza menus, permissões e filiais liberadas sem exigir novo login. */
  const refreshSession = useCallback(async () => {
    if (!localStorage.getItem('auth_token')) return
    try {
      const response = await axios.get<ApiResponse<Sessao>>('/auth/me')
      if (response.data.success) applySession(response.data.data)
    } catch {
      // offline: mantém a sessão salva
    }
  }, [])

  useEffect(() => {
    void refreshSession()
  }, [refreshSession])

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }

  const logoutCleanup = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    localStorage.removeItem('menus')
    localStorage.removeItem('permissoes')
    localStorage.removeItem('tenants')
    setTenantId(null)

    // dados de clientes/notas salvos para uso offline não devem ficar para o próximo usuário do aparelho
    void cacheClear()
    
    setState({
      user: null,
      token: null,
      loading: false,
      menus: [],
      permissoes: [],
      tenants: [],
      tenant: null,
    })
  }

  const signIn = async (
    cpf: string,
    senha: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<
        ApiResponse<Sessao & { token: string }>
      >('/auth/login', {
        cpf,
        senha
      })

      const { data, message } = response.data

      if (!response.data.success) throw new Error(message || 'Erro ao fazer login')

      // Salvando no localStorage para persistência
      localStorage.setItem('auth_token', data.token)

      // armazenando usuário, menus, permissões e filiais para persistência
      applySession(data)
      setState((prev) => ({ ...prev, token: data.token, loading: false }))

      return { success: true, message: 'Login realizado com sucesso!' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const signOut = async () => {
    try {
      const response = await axios.get<ApiResponse>('/auth/logout')

      if (response.data.success) {
        // window.location.href = '/auth/login'
      } else {
        toast.error(
          response.data.message ||
          'Erro ao deslogar. Entre em contato com o suporte caso o erro persista.'
        )
      }
    } catch (e) {
      console.error('Erro ao deslogar no servidor', e)
    } finally {
      logoutCleanup()
    }
  }

  const signUp = async (signUpData: SignUpSchema): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<ApiResponse>('/setup', {
        nome: signUpData.nome,
        cpf: signUpData.cpf,
        senha: signUpData.senha,
        role: 'monitoramento'
      })

      const { message } = response.data
      if (!response.data.success) throw new Error(message || 'Erro ao registrar')

      const loginResult = await signIn(signUpData.cpf, signUpData.senha)
      return loginResult
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const changePassword = async (changePasswordData: ChangePasswordSchema): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.patch<ApiResponse>(`/usuarios/alterar-senha/${changePasswordData.id}`, {
        senha: changePasswordData.senha,
        confirmar_senha: changePasswordData.confirmar_senha,
      })

      const { message } = response.data
      if (!response.data.success) throw new Error(message || 'Erro ao alterar a senha do usuário')

      return response.data
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const checkSession = async (): Promise<boolean> => {
    try {
      const response = await axios.get<ApiResponse<{ usuario: Usuario; menus: Menu[] }>>('/auth/check-session');
      return response.data.success;
    } catch (error: any) {
      console.error('Erro ao verificar sessão', error)
      return false;
    }
  }

  const can = (permissao: Permissao) =>
    state.user?.role === 'administrador' || state.permissoes.includes(permissao)

  const setTenant = (tenantId: string) => {
    if (tenantId === state.tenant?.id) return
    setTenantId(tenantId)
    // recarrega para que todas as telas busquem os dados da nova filial
    window.location.reload()
  }

  const value: AuthContextType = {
    ...state,
    refreshSession,
    can,
    setTenant,
    setLoading,
    signIn,
    signUp,
    signOut,
    changePassword,
    checkSession,
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
