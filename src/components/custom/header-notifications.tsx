import { useEffect, useRef, useState } from 'react'

import { BellIcon } from 'lucide-react'

// Importar o arquivo de áudio diretamente
import notificationAudio from '@/assets/notification.mp3'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip } from '@/components/ui/tooltip'
import { useAuth } from '@/hooks/use-auth'
import useEcho from '@/hooks/use-echo'
import axios from '@/lib/axios'
import dayjs from '@/lib/dayjs'
import { cn } from '@/lib/utils'
import type { ApiResponse } from '@/types/api-response'
import { type Notification } from '@/types/consults'

const HeaderNotifications = () => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const notificationSound = useRef<HTMLAudioElement | null>(null)
  const lastPlayTimeRef = useRef<number>(0)

  // dados do usuário
  const { user } = useAuth()

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

  // Só inicializa o Echo quando o user estiver carregado
  const { messages, clearMessages } = useEcho({
    channelName: user ? `barber.${user.id}.notifications` : '',
    mode: 'event',
    eventName: 'appointment.created',
  })

  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))

    axios.post('notifications/read', { id: [id] })
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))

    axios.post('notifications/read', { id: notifications.map((n) => n.id) })
  }

  const fetchOldNotifications = async () => {
    try {
      const res = await axios.get<ApiResponse<Notification[]>>('notifications')

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

  useEffect(() => {
    if (messages.length > 0 && notificationSound.current) {
      console.log('[HeaderNotifications] Mensagens recebidas:', messages)

      setNotifications((prev) => {
        return [
          ...prev,
          ...messages.map((message) => {
            console.log('[HeaderNotifications] Processando mensagem:', message)
            return {
              id: message.id,
              title: message.title,
              message: message.message,
              type: message.type,
              link: message.link,
              sent_at: message.sent_at,
              read: message.read,
            }
          }),
        ]
      })

      // Reproduzir som com debounce para evitar pool exhausted
      const now = Date.now()
      if (notificationSound.current && now - lastPlayTimeRef.current > PLAY_DEBOUNCE_MS) {
        try {
          // Reinicia o áudio se já estiver tocando
          notificationSound.current.currentTime = 0
          notificationSound.current.play()
          lastPlayTimeRef.current = now
        } catch (error) {
          console.error('Erro ao tocar notificação:', error)
        }
      }

      clearMessages()
    }
  }, [messages, clearMessages])

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

      <PopoverContent className='w-lg p-0 select-none' align='start'>
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
                          'border-l-4 border-blue-500': !notification.read,
                          'cursor-pointer': notification.link,
                        })}
                      >
                        <div
                          className={cn(
                            'flex gap-3 border-b p-4 transition-colors hover:bg-muted/50',
                            notification.read ? 'opacity-70' : ''
                          )}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className='shrink-0 pt-1'>
                            <span
                              className={cn('block h-3 w-3 rounded-full', {
                                'bg-blue-500': notification.type === 'info',
                                'bg-amber-500': notification.type === 'warning',
                                'bg-red-500': notification.type === 'error',
                                'bg-green-500': notification.type === 'success',
                              })}
                            />
                          </div>
                          <div className='flex-1'>
                            <div className='flex items-start justify-between gap-2'>
                              <p
                                className={cn(
                                  'text-sm font-medium',
                                  !notification.read && 'font-semibold'
                                )}
                              >
                                {notification.title || 'Notificação'}
                              </p>

                              <span
                                className='text-[10px] text-muted-foreground whitespace-nowrap'
                                title={dayjs(notification.sent_at).format('DD/MM/YYYY HH:mm:ss')}
                              >
                                {dayjs(notification.sent_at).fromNow()}
                              </span>
                            </div>

                            <p className='mt-1 text-xs text-muted-foreground'>
                              {notification.message}
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
