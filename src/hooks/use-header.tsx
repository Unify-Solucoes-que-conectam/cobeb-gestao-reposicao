import { HeaderContext } from '@/providers/HeaderProvider'
import { useContext } from 'react'

export function useHeader() {
  const context = useContext(HeaderContext)

  if (!context) {
    throw new Error('useHeader deve ser usado dentro de HeaderProvider')
  }

  return context
}
