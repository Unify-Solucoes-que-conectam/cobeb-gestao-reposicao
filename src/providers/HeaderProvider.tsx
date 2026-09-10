import { createContext, type ReactNode, useState } from 'react'

type Breadcrumb = {
  title: string
  href: string
}

type HeaderContextData = {
  pageBreadcrumbs: Breadcrumb[]
  setPageBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
  emitNotificationReceived: () => void
  notificationReceived: number
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([])
  const [notificationReceived, setNotificationReceived] = useState(0)

  const emitNotificationReceived = () => {
    setNotificationReceived((current) => current + 1)
  }

  return (
    <HeaderContext.Provider value={{ pageBreadcrumbs, setPageBreadcrumbs, emitNotificationReceived, notificationReceived }}>{children}</HeaderContext.Provider>
  )
}
