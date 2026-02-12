import { createContext, type ReactNode, useState } from 'react'

type HeaderContextData = {
  pageTitle: string | null
  setPageTitle: (title: string | null) => void
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<string | null>(null)

  return (
    <HeaderContext.Provider value={{ pageTitle, setPageTitle }}>{children}</HeaderContext.Provider>
  )
}
