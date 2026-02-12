import { createContext, useEffect, useState, type ReactNode } from 'react'

import { toast } from 'sonner'

import axios from '@/lib/axios'
import type { Schema } from '@/pages/auth/schemas'
import { ApiResponse } from '@/types/api-response'
import { User } from '@/types/consults'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  setLoading: (loading: boolean) => void
  refreshAuth: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; message: string }>
  signUp: (signUpData: Schema) => Promise<{ success: boolean; message: string }>
  signOut: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('auth_token'),
    loading: true,
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
      const userResponse = await axios.get<ApiResponse<User>>(
        `${API_URL}/auth/me`
      )

      if (!userResponse.data.success) {
        throw new Error('Erro ao carregar usuário')
      }

      setState({
        user: userResponse.data.data,
        token,
        loading: false,
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
    })
  }

  const signIn = async (
    cpf: string,
    password: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<
        ApiResponse<{ user: User; access_token: string }>
      >(`${API_URL}/auth/login`, {
        cpf,
        password
      })

      const { data, message } = response.data

      if (!response.data.success) throw new Error(message || 'Erro ao fazer login')

      // Salvando no localStorage para persistência
      localStorage.setItem('auth_token', data.access_token)

      setState({
        user: data.user,
        token: data.access_token,
        loading: false,
      })

      return { success: true, message: 'Login realizado com sucesso!' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }

  const signOut = async () => {
    try {
      const response = await axios.get<ApiResponse>(`${API_URL}/auth/logout`)

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

  const signUp = async (signUpData: Schema): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await axios.post<ApiResponse>(`${API_URL}/setup`, {
        name: signUpData.name,
        cpf: signUpData.cpf,
        password: signUpData.password,
        password_confirmation: signUpData.password,
      })

      const { message } = response.data
      if (!response.data.success) throw new Error(message || 'Erro ao registrar')

      const loginResult = await signIn(signUpData.cpf, signUpData.password)
      return loginResult
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
    isAuthenticated: !!state.token && !!state.user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
