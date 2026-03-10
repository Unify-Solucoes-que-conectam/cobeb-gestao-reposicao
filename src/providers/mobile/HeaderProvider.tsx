import { createContext, type ReactNode, useState } from 'react'

type HeaderContextData = {
  pageTitle: string
  setPageTitle: (title: string) => void
  pageDescription: string
  setPageDescription: (description: string) => void
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<string>('')
  const [pageDescription, setPageDescription] = useState<string>('')

  return (
    <HeaderContext.Provider value={{
      pageTitle,
      setPageTitle,
      pageDescription,
      setPageDescription
    }}>{children}</HeaderContext.Provider>
  )
}
