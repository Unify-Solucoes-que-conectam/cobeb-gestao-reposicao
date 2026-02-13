import { createContext, type ReactNode, useState } from 'react'

type Breadcrumb = {
  title: string
  href: string
}

type HeaderContextData = {
  pageBreadcrumbs: Breadcrumb[]
  setPageBreadcrumbs: (breadcrumbs: Breadcrumb[]) => void
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageBreadcrumbs, setPageBreadcrumbs] = useState<Breadcrumb[]>([])

  return (
    <HeaderContext.Provider value={{ pageBreadcrumbs, setPageBreadcrumbs }}>{children}</HeaderContext.Provider>
  )
}
