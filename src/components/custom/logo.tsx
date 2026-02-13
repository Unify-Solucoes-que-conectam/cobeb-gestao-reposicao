import LogoLight from '@/assets/cobeb-logo-light.svg?react' 
import LogoDark from '@/assets/cobeb-logo-dark.svg?react'
import { useTheme } from '@/hooks/use-theme'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'light' | 'dark'
}
export function Logo({ className, variant }: LogoProps) {

  // aplica logomarca de acordo com o tema (claro/escuro)
  const Logo = useTheme().theme === 'dark' || variant === 'light' ? LogoLight : LogoDark

  return (
    <Logo className={cn(className, 'h-full')}/>
  )
}
