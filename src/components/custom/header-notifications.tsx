import { useEffect, useRef, useState } from 'react'

import { BellIcon } from 'lucide-react'

// Importar o arquivo de áudio diretamente
import notificationAudio from '@/assets/notification.mp3'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import useEcho from '@/hooks/use-echo'
import axios from '@/lib/axios'
import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api-response'
import { type Notificacao } from '@/types/app'
import { useAuth } from '@/hooks/use-auth'
import { useHeader } from '@/hooks/use-header'

const HeaderNotifications = () => {
  // ID do usuário logado, necessário para o canal privado
  const { user } = useAuth();
  const { emitNotificationReceived } = useHeader();

  const scrollRef = useRef<HTMLDivElement>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const lastPlayTimeRef = useRef<number>(0)

  // Prevenir múltiplas reproduções em um curto período de tempo
  const PLAY_DEBOUNCE_MS = 500

  // Inicializar o som apenas uma vez usando HTMLAudioElement
  useEffect(() => {
    const audio = new Audio(notificationAudio)
    audio.preload = 'auto'
    audio.volume = 0.7
    notificationSound.current = audio

    // Desbloquear áudio na primeira interação global do usuário
    const unlockAudio = () => {
      if (notificationSound.current) {
        notificationSound.current.volume = 0
        notificationSound.current.currentTime = 0
        notificationSound.current
          .play()
          .then(() => {
            // Pausa imediatamente após o play silencioso
            notificationSound.current?.pause()
            notificationSound.current!.currentTime = 0
            notificationSound.current!.volume = 0.7
          })
          .catch(() => {
            // Mesmo se falhar, restaura o volume
            if (notificationSound.current) notificationSound.current.volume = 0.7
          })
      }
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)

    return () => {
      audio.pause()
      audio.src = ''
      notificationSound.current = null
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [])

  // ==========================================
  // 📡 1. CANAL PÚBLICO (Avisos Globais)
  // ==========================================
  const { messages: globalMessages, clearMessages: clearGlobalMessages } = useEcho({
    channelName: 'global-notifications',
    mode: 'event',
    eventName: 'global.notification',
  })

  // ==========================================
  // 🔒 2. CANAL PRIVADO (Notificação do Usuário)
  // ==========================================
  const { messages: userMessages, clearMessages: clearUserMessages } = useEcho({
    channelName: `notifications.${user?.id}`,
    mode: 'notification', // ou mode: 'event' e eventName: 'user.notification'
    isPrivate: true, // Privado
  })

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notificacao[]>([])

  const unreadCount = notifications.filter((n) => !n.lida).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, lida: true } : n)))

    axios.post('notificacoes/lida', { id: [id] })
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, lida: true })))

    axios.post('notificacoes/lida', { id: notifications.map((n) => n.id) })
  }

  const fetchOldNotifications = async () => {
    try {
      const res = await axios.get<ApiResponse<Notificacao[]>>('notificacoes')

      if (res.data.success) {
        const oldNotifications = res.data.data!

        setNotifications((prev) => [...oldNotifications, ...prev])
      }
    } catch {
      setNotifications([])
    }
  }

  useEffect(() => {
    fetchOldNotifications()
  }, [])

  // Scroll automático ao abrir o popover
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        const container = scrollRef.current
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [open])

  // =========================================================
  // 🔔 PROCESSA MENSAGENS RECEBIDAS (MÉTODO UNIFICADO)
  // =========================================================
  useEffect(() => {
    // Une as mensagens vindas de ambos os canais
    const newIncomingMessages = [...globalMessages, ...userMessages]

    if (newIncomingMessages.length > 0) {
      emitNotificationReceived(); // Emite o evento para o HeaderProvider que novas notificações foram recebidas
      console.log('[HeaderNotifications] Novas mensagens recebidas:', newIncomingMessages)

      setNotifications((prev) => [
        ...prev,
        ...newIncomingMessages.map((message) => ({
          id: message.id,
          titulo: message.titulo,
          mensagem: message.mensagem,
          tipo: message.tipo,
          link: message.link,
          data_envio: message.data_envio,
          lida: message.lida ?? false,
        })),
      ])

      // Toca o som de notificação
      const now = Date.now()
      if (notificationSound.current && now - lastPlayTimeRef.current > PLAY_DEBOUNCE_MS) {
        try {
          notificationSound.current.currentTime = 0
          notificationSound.current.play()
          lastPlayTimeRef.current = now
        } catch (error) {
          console.error('Erro ao tocar notificação:', error)
        }
      }

      // Limpa os buffers dos dois hooks para não processar repetido
      if (globalMessages.length > 0) clearGlobalMessages()
      if (userMessages.length > 0) clearUserMessages()
    }


  }, [globalMessages, userMessages, clearGlobalMessages, clearUserMessages])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Tooltip content='Notificações' align='center'>
          <Button variant='ghost' size='icon' className='size-7 relative'>
            <BellIcon />

            {unreadCount > 0 && (
              <span className='absolute top-0 right-0 flex h-3 w-3 items-center justify-center rounded-full bg-red-500'></span>
            )}

            <span className='sr-only'>Notificações</span>
          </Button>
        </Tooltip>
      </PopoverTrigger>

      <PopoverContent className='w-lg p-0 select-none' align='end'>
        {notifications.length > 0 ? (
          <>
            <div className='flex items-center justify-between border-b px-4 py-2'>
              <h3 className='font-medium pl-3'>Notificações</h3>
              <Button
                variant='ghost'
                size='sm'
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
                className='text-xs text-muted-foreground hover:text-foreground'
              >
                Marcar todas como lidas
              </Button>
            </div>

            <div className='h-87.5 overflow-auto' ref={scrollRef}>
              {Array.from(new Map(notifications.map((n) => [n.id, n])).values()).map(
                (notification) => {
                  const Component = notification.link ? 'a' : 'div'
                  return (
                    <Component
                      key={notification.id}
                      href={notification.link || '#'}
                      target='_blank'
                      onClick={() => {
                        if (notification.link) setOpen(false)
                      }}
                    >
                      <div
                        className={cn({
                          'border-l-4 border-blue-500': !notification.lida,
                          'cursor-pointer': notification.link,
                        })}
                      >
                        <div
                          className={cn(
                            'flex gap-3 border-b p-4 transition-colors hover:bg-muted/50',
                            notification.lida ? 'opacity-70' : ''
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className='shrink-0 pt-1'>
                            <span
                              className={cn('block h-3 w-3 rounded-full', {
                                'bg-blue-500': notification.tipo === 'info',
                                'bg-amber-500': notification.tipo === 'warning',
                                'bg-red-500': notification.tipo === 'error',
                                'bg-green-500': notification.tipo === 'success',
                              })}
                            />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-start justify-between gap-2'>
                              <p
                                className={cn(
                                  'text-sm font-medium',
                                  !notification.lida && 'font-semibold'
                                )}
                              >
                                {notification.titulo || 'Notificação'}
                              </p>

                              <span
                                className='text-[10px] text-muted-foreground whitespace-nowrap'
                                title={dayjs(notification.data_envio).format('DD/MM/YYYY HH:mm:ss')}
                              >
                                {dayjs(notification.data_envio).fromNow()}
                              </span>
                            </div>

                            <p className='mt-1 text-xs text-muted-foreground'>
                              {notification.mensagem}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Component>
                  )
                }
              )}
            </div>
          </>
        ) : (
          <div className='p-4 text-center text-gray-500'>
            <p>Nenhuma notificação no momento</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export default HeaderNotifications
