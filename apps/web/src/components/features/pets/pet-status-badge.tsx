import { cva } from 'class-variance-authority'
import { cn } from '~/lib/utils'

// ─── Status → display label ────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  ADOPTED: 'Adotado',
}

// ─── Variants ──────────────────────────────────────────────────────────────────

const petStatusBadgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide',
  {
    variants: {
      status: {
        DRAFT: 'bg-muted text-muted-foreground',
        PENDING_REVIEW: 'bg-warning-light text-accent-navy',
        APPROVED: 'bg-success-light text-success',
        REJECTED: 'bg-destructive/10 text-destructive',
        ADOPTED: 'bg-accent-navy/10 text-accent-navy',
      },
    },
    defaultVariants: { status: 'DRAFT' },
  },
)

// ─── Component ─────────────────────────────────────────────────────────────────

interface PetStatusBadgeProps {
  status: string
  className?: string
}

export function PetStatusBadge({ status, className }: PetStatusBadgeProps) {
  const variant = (
    ['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ADOPTED'].includes(
      status,
    )
      ? status
      : 'DRAFT'
  ) as 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'ADOPTED'

  return (
    <span
      data-slot="pet-status-badge"
      className={cn(petStatusBadgeVariants({ status: variant }), className)}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
