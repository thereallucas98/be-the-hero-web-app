'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import * as ProgressPrimitive from '@radix-ui/react-progress'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  CLOSED: 'Encerrada',
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'warning'
> = {
  DRAFT: 'outline',
  PENDING_REVIEW: 'warning',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CLOSED: 'secondary',
}

export interface WorkspaceCampaignItem {
  id: string
  workspaceId: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  status: string
  startsAt: string | null
  endsAt: string | null
  createdAt: string
}

interface WorkspaceCampaignCardProps extends ComponentProps<'div'> {
  campaign: WorkspaceCampaignItem
  workspaceId: string
}

export function WorkspaceCampaignCard({
  campaign,
  workspaceId,
  className,
  ...props
}: WorkspaceCampaignCardProps) {
  const goal = Number(campaign.goalAmount)
  const current = Number(campaign.currentAmount)
  const percent =
    goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  return (
    <Link
      href={`/workspaces/${workspaceId}/campaigns/${campaign.id}`}
      className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div
        data-slot="workspace-campaign-card"
        className={cn(
          'border-border bg-card hover:bg-muted/50 flex flex-col gap-3 rounded-xl border p-4 shadow-sm transition-colors',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-foreground line-clamp-1 text-sm font-semibold">
            {campaign.title}
          </h3>
          <Badge
            variant={STATUS_VARIANT[campaign.status] ?? 'outline'}
            className="shrink-0 text-xs"
          >
            {STATUS_LABEL[campaign.status] ?? campaign.status}
          </Badge>
        </div>

        <p className="text-muted-foreground line-clamp-2 text-xs">
          {campaign.description}
        </p>

        {/* Progress */}
        <div className="flex flex-col gap-1.5">
          <ProgressPrimitive.Root className="bg-muted relative h-2 w-full overflow-hidden rounded-full">
            <ProgressPrimitive.Indicator
              className="bg-primary h-full transition-all"
              style={{ width: `${percent}%` }}
            />
          </ProgressPrimitive.Root>
          <div className="flex items-center justify-between text-xs">
            <span className="text-foreground font-medium">
              {current.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}
            </span>
            <span className="text-muted-foreground">
              de{' '}
              {goal.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })}{' '}
              ({percent}%)
            </span>
          </div>
        </div>

        {campaign.endsAt && (
          <time className="text-muted-foreground text-xs">
            Encerra em {new Date(campaign.endsAt).toLocaleDateString('pt-BR')}
          </time>
        )}
      </div>
    </Link>
  )
}
