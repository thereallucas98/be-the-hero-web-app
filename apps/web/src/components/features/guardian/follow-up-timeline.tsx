import type { ComponentProps } from 'react'
import { CheckCircle2, Circle, Clock, XCircle } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { FOLLOW_UP_STATUS_LABEL, FOLLOW_UP_TYPE_LABEL } from './guardian-labels'

interface FollowUpItem {
  id: string | null
  type: string | null
  status: string | null
  scheduledAt: string | null
  currentSubmission: {
    id: string | null
    status: string | null
    submittedAt: string | null
  } | null
}

interface FollowUpTimelineProps extends ComponentProps<'div'> {
  followUps: FollowUpItem[]
}

const STATUS_ICON: Record<string, React.ElementType> = {
  PENDING: Clock,
  SUBMITTED: Circle,
  APPROVED: CheckCircle2,
  REJECTED: XCircle,
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  PENDING: 'outline',
  SUBMITTED: 'secondary',
  APPROVED: 'default',
  REJECTED: 'destructive',
}

export function FollowUpTimeline({
  followUps,
  className,
  ...props
}: FollowUpTimelineProps) {
  if (followUps.length === 0) return null

  return (
    <div
      data-slot="follow-up-timeline"
      className={cn('flex flex-col gap-0', className)}
      {...props}
    >
      {followUps.map((followUp, index) => {
        const Icon = STATUS_ICON[followUp.status ?? ''] ?? Circle
        const isLast = index === followUps.length - 1

        return (
          <div key={followUp.id} className="flex gap-3">
            {/* Timeline line + icon */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex size-8 shrink-0 items-center justify-center rounded-full',
                  followUp.status === 'APPROVED'
                    ? 'bg-primary/10 text-primary'
                    : followUp.status === 'REJECTED'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden />
              </div>
              {!isLast && <div className="bg-border w-px flex-1" />}
            </div>

            {/* Content */}
            <div className={cn('flex flex-col gap-1 pb-6', isLast && 'pb-0')}>
              <div className="flex items-center gap-2">
                <span className="text-foreground text-sm font-medium">
                  {FOLLOW_UP_TYPE_LABEL[followUp.type ?? ''] ?? followUp.type}
                </span>
                {followUp.status && (
                  <Badge
                    variant={STATUS_VARIANT[followUp.status] ?? 'outline'}
                    className="text-xs"
                  >
                    {FOLLOW_UP_STATUS_LABEL[followUp.status] ?? followUp.status}
                  </Badge>
                )}
              </div>

              {followUp.scheduledAt && (
                <time className="text-muted-foreground text-xs">
                  Previsto para{' '}
                  {new Date(followUp.scheduledAt).toLocaleDateString('pt-BR')}
                </time>
              )}

              {followUp.currentSubmission?.submittedAt && (
                <time className="text-muted-foreground text-xs">
                  Enviado em{' '}
                  {new Date(
                    followUp.currentSubmission.submittedAt,
                  ).toLocaleDateString('pt-BR')}
                </time>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
