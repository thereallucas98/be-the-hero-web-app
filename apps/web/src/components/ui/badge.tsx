import * as React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { twMerge } from 'tailwind-merge'

export const badgeVariants = tv({
  base: 'inline-flex items-center rounded-badge border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  variants: {
    variant: {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-brand-primary-pale text-accent-navy',
      warning: 'border-transparent bg-accent-yellow text-neutral-near-black',
      destructive:
        'border-transparent bg-destructive text-destructive-foreground',
      outline: 'border-border text-foreground bg-transparent',
      success: 'border-transparent bg-success text-white',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={twMerge(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge }
