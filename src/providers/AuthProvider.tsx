import { createContext, useEffect, useState, type ReactNode } from 'react'

import { toast } from 'sonner'

import axios from '@/lib/axios'
import type { Schema as SignUpSchema } from '@/pages/auth/schemas'
import { ApiResponse } from '@/types/api-response'
import { Menu, Usuario } from '@/types/app'
import { Schema as ChangePasswordSchema } from '@/components/custom/password-changer/schemas'

interface AuthState {
  user: Usuario | null
  token: string | null
  loading: boolean
  menus: Menu[],
}

interface AuthContextType extends AuthState {
  setLoading: (loading: boolean) => void
  refreshAuth: () => Promise<void>
  signIn: (cpf: string, senha: string) => Promise<{ success: boolean; message: string }>
  signUp: (signUpData: SignUpSchema) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  changePassword: (changePasswordData: ChangePasswordSchema) => Promise<{ success: boolean; message: string }>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    loading: true,
    menus: []
  })

  const setLoading = (loading: boolean) => {
    setState((prev) => ({ ...prev, loading }))
  }

  const loadAuthData = async () => {
    const token = localStorage.getItem('auth_token')

    if (!token) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }

    try {
      // Busca dados do usuário autenticado
      const userResponse = await axios.get<ApiResponse<{ usuario: Usuario; menus: Menu[] }>>(
        '/auth/me'
      )

      if (!userResponse.data.success) {
        throw new Error('Erro ao carregar usuário')
      }

      setState({
        user: userResponse.data.data.usuario,
        token,
        loading: false,
        menus: userResponse.data.data.menus
      })
    } catch (error) {
      console.error('Erro ao carregar dados de autenticação:', error)
      // Limpa dados inválidos
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_role')
      setState({
        user: null,
        token: null,
        loading: false,
        menus: []
      })
    }
  }

  // Carrega os dados do usuário e barbershop ao inicializar se tiver token
  useEffect(() => {
    loadAuthData()
  }, [])

  const logoutCleanup = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_role')
    setState({
      user: null,
      token: null,
      loading: false,
      menus: []
    })
  }

  const signIn = async (
    cpf: string,
    senha: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<
        ApiResponse<{ usuario: Usuario; token: string; menus: Menu[] }>
      >('/auth/login', {
        cpf,
        senha
      })

      const { data, message } = response.data

      if (!response.data.success) throw new Error(message || 'Erro ao fazer login')

      // Salvando no localStorage para persistência
      localStorage.setItem('auth_token', data.token)

      setState({
        user: data.usuario,
        token: data.token,
        loading: false,
        menus: data.menus,
      })

      return { success: true, message: 'Login realizado com sucesso!' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const signOut = async () => {
    try {
      const response = await axios.get<ApiResponse>('/auth/logout')

      if (response.data.success) {
        window.location.href = '/auth/login'
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

  const value: AuthContextType = {
    ...state,
    refreshAuth: loadAuthData,
    setLoading,
    signIn,
    signUp,
    signOut,
    changePassword,
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
