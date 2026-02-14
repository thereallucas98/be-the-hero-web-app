import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '~/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'p-2 bg-primary text-primary-foreground shadow hover:bg-primary/90',
        submit:
          'bg-gray-100 text-primary-foreground shadow hover:bg-gray-100/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:opacity-90 hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:opacity-90 hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:opacity-90 hover:bg-secondary/80',
        ghost: 'hover:opacity-90',
        navigation: 'text-sm text-gray-400 font-normal hover:opacity-90',
        reset:
          'bg-gray-500 text-gray-200 hover:bg-gray-500/90 hover:text-gray-100',
        link: 'text-primary underline-offset-4 hover:underline',
        user: 'flex bg-primary w-full flex-row items-start lg:items-center gap-8 p-8 text-lg font-bold text-gray-600 xl:h-28 xl:w-72 xl:py-4',
        professional:
          'flex bg-feedback-done w-full flex-row items-start lg:items-center gap-8 p-8 text-lg font-bold text-gray-600 xl:h-28 xl:w-72 xl:py-4',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-7 rounded-md px-4 py-2 text-xs',
        lg: 'rounded-md px-4 py-5 text-base',
        icon: 'h-10',
        padding: 'p-0 py-2 w-full',
        navigation: 'h-auto',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
