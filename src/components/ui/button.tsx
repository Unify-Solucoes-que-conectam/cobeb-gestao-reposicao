import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { LoaderCircleIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        solid: 'shadow-xs',
        outline:
          'border bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input',
        ghost: '',
        link: 'underline-offset-4 hover:underline shadow-none',
      },
      color: {
        default: '',
        destructive: '',
        success: '',
        warning: '',
        info: '',
        neutral: '',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        xs: 'h-6 rounded-sm px-2 text-xs has-[>svg]:px-2',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        icon: 'size-9',
      },
    },
    compoundVariants: [
      // Solid variants
      {
        variant: 'solid',
        color: 'default',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        variant: 'solid',
        color: 'destructive',
        class:
          'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20 dark:bg-red-600 dark:hover:bg-red-700 dark:focus-visible:ring-red-400/30',
      },
      {
        variant: 'solid',
        color: 'success',
        class:
          'bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500/20 dark:bg-green-600 dark:hover:bg-green-700 dark:focus-visible:ring-green-400/30',
      },
      {
        variant: 'solid',
        color: 'warning',
        class:
          'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500/20 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus-visible:ring-yellow-400/30',
      },
      {
        variant: 'solid',
        color: 'info',
        class:
          'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:ring-blue-400/30',
      },
      {
        variant: 'solid',
        color: 'neutral',
        class:
          'bg-slate-500 text-white hover:bg-slate-600 focus-visible:ring-slate-500/20 dark:bg-slate-600 dark:hover:bg-slate-700 dark:focus-visible:ring-slate-400/30',
      },

      // Outline variants
      {
        variant: 'outline',
        color: 'default',
        class: 'hover:bg-accent dark:hover:bg-accent/50',
      },
      {
        variant: 'outline',
        color: 'destructive',
        class:
          'border-red-500 text-red-500 bg-red-50 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500/20 dark:bg-red-500/10 dark:border-red-600 dark:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400 dark:focus-visible:ring-red-400/30',
      },
      {
        variant: 'outline',
        color: 'success',
        class:
          'border-green-500 text-green-500 bg-green-50 hover:bg-green-50 hover:text-green-600 focus-visible:ring-green-500/20 dark:bg-green-500/10 dark:border-green-600 dark:text-green-500 dark:hover:bg-green-500/20 dark:hover:text-green-200 dark:focus-visible:ring-green-400/30',
      },
      {
        variant: 'outline',
        color: 'warning',
        class:
          'border-yellow-500 text-yellow-500 bg-yellow-50 hover:bg-yellow-50 hover:text-yellow-600 focus-visible:ring-yellow-500/20 dark:bg-yellow-500/10 dark:border-yellow-600 dark:text-yellow-500 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-200 dark:focus-visible:ring-yellow-400/30',
      },
      {
        variant: 'outline',
        color: 'info',
        class:
          'border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 focus-visible:ring-blue-500/20 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950 dark:hover:text-blue-200 dark:focus-visible:ring-blue-400/30',
      },
      {
        variant: 'outline',
        color: 'neutral',
        class:
          'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-800 focus-visible:ring-slate-500/20 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950 dark:hover:text-slate-200 dark:focus-visible:ring-slate-400/30',
      },

      // Ghost variants
      {
        variant: 'ghost',
        color: 'default',
        class: 'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
      },
      {
        variant: 'ghost',
        color: 'destructive',
        class:
          'text-red-600 hover:bg-red-50 hover:text-red-700 focus-visible:ring-red-500/20 dark:text-red-400 dark:hover:bg-red-950 dark:hover:text-red-300 dark:focus-visible:ring-red-400/30',
      },
      {
        variant: 'ghost',
        color: 'success',
        class:
          'text-green-600 hover:bg-green-50 hover:text-green-700 focus-visible:ring-green-500/20 dark:text-green-400 dark:hover:bg-green-950 dark:hover:text-green-300 dark:focus-visible:ring-green-400/30',
      },
      {
        variant: 'ghost',
        color: 'warning',
        class:
          'text-yellow-600 hover:bg-yellow-50 hover:text-yellow-700 focus-visible:ring-yellow-500/20 dark:text-yellow-400 dark:hover:bg-yellow-950 dark:hover:text-yellow-300 dark:focus-visible:ring-yellow-400/30',
      },
      {
        variant: 'ghost',
        color: 'info',
        class:
          'text-blue-600 hover:bg-blue-50 hover:text-blue-700 focus-visible:ring-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-950 dark:hover:text-blue-300 dark:focus-visible:ring-blue-400/30',
      },
      {
        variant: 'ghost',
        color: 'neutral',
        class:
          'text-slate-600 hover:bg-slate-50 hover:text-slate-700 focus-visible:ring-slate-500/20 dark:text-slate-400 dark:hover:bg-slate-950 dark:hover:text-slate-300 dark:focus-visible:ring-slate-400/30',
      },

      // Link variants
      {
        variant: 'link',
        color: 'default',
        class: 'text-primary hover:text-primary/80',
      },
      {
        variant: 'link',
        color: 'destructive',
        class: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300',
      },
      {
        variant: 'link',
        color: 'success',
        class: 'text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300',
      },
      {
        variant: 'link',
        color: 'warning',
        class: 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300',
      },
      {
        variant: 'link',
        color: 'info',
        class: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300',
      },
      {
        variant: 'link',
        color: 'neutral',
        class: 'text-slate-600 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300',
      },
    ],
    defaultVariants: {
      variant: 'solid',
      color: 'default',
      size: 'default',
    },
  }
)

function Button({
  className,
  variant,
  color,
  size,
  children,
  asChild = false,
  loading = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot='button'
      className={cn(buttonVariants({ variant, color, size, className }))}
      {...props}
    >
      {loading && <LoaderCircleIcon className='animate-spin' />}
      {children}
    </Comp>
  )
}

export { Button, buttonVariants }
