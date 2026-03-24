import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

// ─── Status → display label ────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovado',
  REJECTED: 'Rejeitado',
  ADOPTED: 'Adotado',
}

const STATUS_CLASS: Record<string, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  PENDING_REVIEW: 'bg-warning-light text-accent-navy',
  APPROVED: 'bg-success-light text-success',
  REJECTED: 'bg-destructive/10 text-destructive',
  ADOPTED: 'bg-accent-navy/10 text-accent-navy',
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface PetStatusBadgeProps {
  status: string
  className?: string
}

export function PetStatusBadge({ status, className }: PetStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      data-slot="pet-status-badge"
      className={cn(
        'rounded-full border-transparent text-[11px] font-bold tracking-wide uppercase',
        STATUS_CLASS[status] ?? STATUS_CLASS.DRAFT,
        className,
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </Badge>
  )
}
