import { createContext, type ReactNode, useState } from 'react'

type Breadcrumb = {
  title: string
  href: string
}

type HeaderContextData = {
  pageBreadcrumbs: Breadcrumb[]
  setPageBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  emitNotificationReceived: () => void
  notificationReceived: boolean
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([])
  const [notificationReceived, setNotificationReceived] = useState(false)

  const emitNotificationReceived = () => {
    setNotificationReceived(true)

    setTimeout(() => {
      setNotificationReceived(false)
    }, 5000) // Reseta o estado após 5 segundos
  }

  return (
    <HeaderContext.Provider value={{ pageBreadcrumbs, setPageBreadcrumbs, emitNotificationReceived, notificationReceived }}>{children}</HeaderContext.Provider>
  )
}
