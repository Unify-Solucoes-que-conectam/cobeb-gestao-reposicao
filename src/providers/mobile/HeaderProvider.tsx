import { createContext, type ReactNode, useState } from 'react'

type HeaderContextData = {
  pageTitle: string | null
  setPageTitle: (title: string | null) => void
  pageDescription: string
  setPageDescription: (description: string) => void
  showBackButton: boolean
  setShowBackButton: (show: boolean) => void
}

export const HeaderContext = createContext<HeaderContextData | undefined>(undefined)

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [pageTitle, setPageTitle] = useState<string | null>(null)
  const [pageDescription, setPageDescription] = useState<string>('')
  const [showBackButton, setShowBackButton] = useState<boolean>(false)

  return (
    <HeaderContext.Provider value={{
      pageTitle,
      setPageTitle,
      pageDescription,
      setPageDescription,
      showBackButton,
      setShowBackButton,
    }}>{children}</HeaderContext.Provider>
  )
}
