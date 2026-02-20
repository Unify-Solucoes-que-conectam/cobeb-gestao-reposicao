import * as React from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'

import { cn } from '@/lib/utils'
import { cva, VariantProps } from 'class-variance-authority'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot='tooltip-provider'
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function TooltipRoot({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot='tooltip' {...props} />
    </TooltipProvider>
  )
}

interface TooltipProps {
  content: React.ReactNode
  children: React.ReactNode
  className?: string
  disabled?: boolean
  align?: 'center' | 'start' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  color?: 'default' | 'destructive' | 'success' | 'warning' | 'info' | 'neutral'
  variant?: 'solid' | 'outline'
}

const Tooltip = ({
  content,
  align = 'center',
  side = 'top',
  disabled = false,
  className,
  color,
  variant,
  ...props
}: TooltipProps) => {
  if (disabled) return props.children

  return (
    <TooltipProvider>
      <TooltipRoot>
        <TooltipTrigger asChild {...props} />

        <TooltipContent align={align} side={side} className={className} color={color} variant={variant}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot='tooltip-trigger' {...props} />
}

const tooltipVariants = cva(
  "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
  {
    variants: {
      variant: {
        solid: 'shadow-xs',
        outline:
          'border bg-background shadow-xs hover:text-accent-foreground dark:bg-input/30 dark:border-input',
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
        color: 'default',
        variant: 'solid',
        class: 'bg-primary text-primary-foreground hover:bg-primary/90',
      },
      {
        color: 'destructive',
        variant: 'solid',
        class:
          'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500/20 dark:bg-red-600 dark:hover:bg-red-700 dark:focus-visible:ring-red-400/30',
      },
      {
        color: 'success',
        variant: 'solid',
        class:
          'bg-green-500 text-white hover:bg-green-600 focus-visible:ring-green-500/20 dark:bg-green-600 dark:hover:bg-green-700 dark:focus-visible:ring-green-400/30',
      },
      {
        color: 'warning',
        variant: 'solid',
        class:
          'bg-yellow-500 text-white hover:bg-yellow-600 focus-visible:ring-yellow-500/20 dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:focus-visible:ring-yellow-400/30',
      },
      {
        color: 'info',
        variant: 'solid',
        class:
          'bg-blue-500 text-white hover:bg-blue-600 focus-visible:ring-blue-500/20 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus-visible:ring-blue-400/30',
      },
      {
        color: 'neutral',
        variant: 'solid',
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
          'border-red-500 text-red-500 bg-red-50 hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-500/20 dark:bg-background dark:border-red-600 dark:text-red-200 dark:hover:bg-red-950 dark:focus-visible:ring-red-400/30',
      },
      {
        variant: 'outline',
        color: 'success',
        class:
          'border-green-500 text-green-500 bg-green-50 hover:bg-green-50 hover:text-green-600 focus-visible:ring-green-500/20 dark:bg-background dark:border-green-600 dark:text-green-500 dark:hover:bg-green-950 dark:focus-visible:ring-green-400/30',
      },
      {
        variant: 'outline',
        color: 'warning',
        class:
          'border-yellow-500 text-yellow-500 bg-yellow-50 hover:bg-yellow-50 hover:text-yellow-600 focus-visible:ring-yellow-500/20 dark:bg-background dark:border-yellow-600 dark:text-yellow-200 dark:hover:bg-yellow-950 dark:focus-visible:ring-yellow-400/30',
      },
      {
        variant: 'outline',
        color: 'info',
        class:
          'border-blue-500 text-blue-500 bg-blue-50 hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-blue-500/20 dark:bg-background dark:border-blue-600 dark:text-blue-200 dark:hover:bg-blue-950 dark:focus-visible:ring-blue-400/30',
      },
      {
        variant: 'outline',
        color: 'neutral',
        class:
          'border-slate-500 text-slate-500 bg-slate-50 hover:bg-slate-50 hover:text-slate-600 focus-visible:ring-slate-500/20 dark:bg-background dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-950 dark:focus-visible:ring-slate-400/30',
      },
    ],
    defaultVariants: {
      color: 'default',
      size: 'default',
    },
  }
)

function TooltipContent({
  className,
  color = "default",
  variant = "solid",
  size,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> &
  VariantProps<typeof tooltipVariants> & {
    asChild?: boolean
    loading?: boolean
  }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot='tooltip-content'
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ color, size, variant, className }))}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className={cn("z-50 size-2.5 translate-y-[calc(-50%-2px)] rotate-45 rounded-[2px]", {
          "bg-primary fill-primary": color === 'default',
          "bg-red-500 fill-red-500": color === 'destructive',
          "bg-green-500 fill-green-500": color === 'success',
          "bg-yellow-500 fill-yellow-500": color === 'warning',
          "bg-blue-500 fill-blue-500": color === 'info',
          "bg-slate-500 fill-slate-500": color === 'neutral',
        })} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipRoot, TooltipTrigger }

