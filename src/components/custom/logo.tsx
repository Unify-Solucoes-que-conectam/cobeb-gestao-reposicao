import LogoLight from '@/assets/cobeb-logo-light.svg?react' 
import LogoDark from '@/assets/cobeb-logo-dark.svg?react'
import { useTheme } from '@/hooks/use-theme'

interface LogoProps {
  className?: string
}
export function Logo({ className }: LogoProps) {

  // aplica logomarca de acordo com o tema (claro/escuro)
  const Logo = useTheme().theme === 'dark' ? LogoLight : LogoDark

  return (
    <Logo className={className} />
  )
}
