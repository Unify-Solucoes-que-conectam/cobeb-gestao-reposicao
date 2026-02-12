import { useEffect, useRef, useState } from 'react'

import Echo, { type Broadcaster } from 'laravel-echo'

import type { Notification } from '@/types/consults'

type UseEchoOptions = {
  channelName: string
  mode: 'notification' | 'event'
  eventName?: string // obrigatório se mode === "event"
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success'
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'failed'

const useEcho = ({ channelName, mode, eventName }: UseEchoOptions) => {
  const echoRef = useRef<Echo<keyof Broadcaster> | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastErrorLogRef = useRef<number>(0)
  const isUnmountedRef = useRef(false)

  const [messages, setMessages] = useState<Notification[]>([])
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [error, setError] = useState<string | null>(null)

  // Configurações de reconexão
  const MAX_RECONNECT_ATTEMPTS = 5
  const INITIAL_RECONNECT_DELAY = 1000 // 1 segundo
  const MAX_RECONNECT_DELAY = 30000 // 30 segundos
  const ERROR_LOG_INTERVAL = 10000 // Log apenas a cada 10 segundos

  // Calcula o delay de reconexão com backoff exponencial
  const getReconnectDelay = (attempt: number) => {
    const delay = Math.min(INITIAL_RECONNECT_DELAY * Math.pow(2, attempt), MAX_RECONNECT_DELAY)
    // Adiciona um jitter aleatório de até 1 segundo
    return delay + Math.random() * 1000
  }

  // Log de erro controlado para evitar poluição do console
  const logError = (message: string, err?: unknown) => {
    const now = Date.now()
    if (now - lastErrorLogRef.current > ERROR_LOG_INTERVAL) {
      console.warn(`[WebSocket] ${message}`, err || '')
      lastErrorLogRef.current = now
    }
  }

  useEffect(() => {
    let echo: Echo<keyof Broadcaster> | null = null
    isUnmountedRef.current = false

    const initializeEcho = async () => {
      if (isUnmountedRef.current) return

      // Não inicializa se o channelName estiver vazio
      if (!channelName || channelName.trim() === '') {
        console.warn('[WebSocket] Canal vazio, aguardando dados do usuário...')
        setConnectionStatus('disconnected')
        return
      }

      try {
        setConnectionStatus('connecting')

        const Echo = (await import('laravel-echo')).default
        const Pusher = (await import('pusher-js')).default

        ;(window as any).Pusher = Pusher

        // helpers
        const envPort = import.meta.env.VITE_REVERB_PORT
        const parsedPort =
          typeof envPort === 'string' && envPort.trim() !== '' ? Number(envPort) : undefined
        const scheme =
          import.meta.env.VITE_REVERB_SCHEME ||
          (typeof window !== 'undefined' && window.location.protocol.replace(':', '')) ||
          'https'
        const forceTLS = scheme === 'https'

        // monte as opções dinamicamente, assim evitamos passar 0/NaN
        const echoOptions: Broadcaster['reverb']['options'] = {
          broadcaster: 'reverb',
          key: import.meta.env.VITE_REVERB_APP_KEY,
          wsHost:
            import.meta.env.VITE_REVERB_HOST ||
            (typeof window !== 'undefined' ? window.location.hostname : 'localhost'),
          forceTLS,
          enabledTransports: ['ws', 'wss'],
          activityTimeout: 30000,
          pongTimeout: 10000,
          authEndpoint: `${import.meta.env.VITE_API_URL}/broadcasting/auth`,
          auth: {
            headers: {
              get 'Authorization'() {
                const token = localStorage.getItem('auth_token')
                return token ? `Bearer ${token}` : ''
              },
              get 'X-Barbershop-Id'() {
                return (
                  localStorage.getItem('active_barbershop_id') ||
                  sessionStorage.getItem('active_barbershop_id') ||
                  ''
                )
              },
              'Accept': 'application/json',
            },
          },
        }

        // só define portas se o env existiu e foi convertido para número válido
        if (typeof parsedPort !== 'undefined' && !Number.isNaN(parsedPort) && parsedPort > 0) {
          echoOptions.wsPort = parsedPort
          echoOptions.wssPort = parsedPort
        }

        echo = new Echo(echoOptions)

        if (isUnmountedRef.current) {
          echo.disconnect()
          return
        }

        echoRef.current = echo

        // Eventos de conexão do Pusher
        const pusher = (echo.connector as Broadcaster['reverb']['connector']).pusher

        pusher.connection.bind('connected', () => {
          if (!isUnmountedRef.current) {
            setConnectionStatus('connected')
            setError(null)
            reconnectAttemptsRef.current = 0
          }
        })

        pusher.connection.bind('disconnected', () => {
          if (!isUnmountedRef.current) {
            setConnectionStatus('disconnected')
            logError('WebSocket desconectado')
          }
        })

        pusher.connection.bind('unavailable', () => {
          if (!isUnmountedRef.current) {
            handleReconnect()
          }
        })

        pusher.connection.bind('error', (err: unknown) => {
          if (!isUnmountedRef.current) {
            logError('Erro de conexão WebSocket', err)
            handleReconnect()
          }
        })

        const channel = echo.private(channelName)

        if (mode === 'notification') {
          channel.notification((notification: Notification) => {
            console.log('[Echo] Notificação recebida:', notification)
            if (!isUnmountedRef.current) {
              setMessages((prev) => [...prev, notification])
            }
          })
        } else if (mode === 'event' && eventName) {
          // Quando usamos broadcastAs() no Laravel, o Echo espera o evento com ponto no início
          const listenEventName = eventName.startsWith('.') ? eventName : `.${eventName}`
          channel.listen(listenEventName, (data: unknown) => {
            // Se for string JSON, fazer parse
            let parsedData = data
            if (typeof data === 'string') {
              try {
                parsedData = JSON.parse(data)
              } catch (e) {
                console.error('[Echo] Erro ao fazer parse dos dados:', e)
              }
            }

            if (!isUnmountedRef.current) {
              setMessages((prev) => [...prev, parsedData as Notification])
            }
          })
        } else {
          throw new Error("eventName deve ser fornecido quando mode = 'event'")
        }

        channel.subscribed(() => {
          if (!isUnmountedRef.current) {
            setConnectionStatus('connected')
            setError(null)
            reconnectAttemptsRef.current = 0
          }
        })

        channel.error((err: unknown) => {
          if (!isUnmountedRef.current) {
            logError('Erro no canal', err)
            handleReconnect()
          }
        })
      } catch (err: unknown) {
        if (!isUnmountedRef.current) {
          logError('Erro ao inicializar Echo', err)
          setError(
            `Erro ao inicializar: ${err instanceof Error ? err.message : 'Erro desconhecido'}`
          )
          handleReconnect()
        }
      }
    }

    const handleReconnect = () => {
      if (isUnmountedRef.current) return

      if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus('failed')
        setError('Não foi possível conectar ao servidor de notificações')
        logError(`Falha após ${MAX_RECONNECT_ATTEMPTS} tentativas de reconexão`)
        return
      }

      setConnectionStatus('reconnecting')
      reconnectAttemptsRef.current += 1

      const delay = getReconnectDelay(reconnectAttemptsRef.current - 1)

      if (reconnectAttemptsRef.current === 1) {
        console.log(`🔄 Tentando reconectar WebSocket...`)
      }

      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isUnmountedRef.current && echo) {
          echo.disconnect()
        }
        initializeEcho()
      }, delay)
    }

    initializeEcho()

    return () => {
      isUnmountedRef.current = true

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }

      if (echo) {
        try {
          echo.leaveChannel(channelName)
          echo.disconnect()
        } catch {
          // Silenciosamente ignora erros de desconexão
        }
      }
    }
  }, [channelName, mode, eventName])

  const clearMessages = () => setMessages([])

  return {
    messages,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    error,
    clearMessages,
  }
}

export default useEcho
