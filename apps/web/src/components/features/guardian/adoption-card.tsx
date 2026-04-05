'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { PawPrint } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import {
  ADOPTION_STATUS_LABEL,
  FOLLOW_UP_STATUS_LABEL,
  SPECIES_LABEL,
} from './guardian-labels'

interface AdoptionCardProps extends ComponentProps<'div'> {
  adoption: {
    id: string | null
    adoptedAt: string | null
    status: string | null
    pet: {
      id: string | null
      name: string | null
      species: string | null
      coverImage: { url: string | null } | null
    } | null
    followUps: Array<{
      id: string | null
      status: string | null
    }> | null
  }
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

export function AdoptionCard({
  adoption,
  className,
  ...props
}: AdoptionCardProps) {
  const pet = adoption.pet
  const followUps = adoption.followUps ?? []
  const completedCount = followUps.filter((f) => f.status === 'APPROVED').length

  return (
    <Link
      href={`/guardian/adoptions/${adoption.id}`}
      className="focus-visible:ring-ring rounded-xl focus-visible:ring-2 focus-visible:outline-none"
    >
      <div
        data-slot="adoption-card"
        className={cn(
          'border-border bg-card hover:bg-muted/50 flex items-start gap-4 rounded-xl border p-4 shadow-sm transition-colors',
          className,
        )}
        {...props}
      >
        {/* Pet thumbnail */}
        <div className="bg-muted flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg">
          {pet?.coverImage?.url ? (
            <img
              src={pet.coverImage.url}
              alt={pet.name ?? 'Pet'}
              className="size-full object-cover"
            />
          ) : (
            <PawPrint className="text-muted-foreground size-6" aria-hidden />
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-foreground truncate text-sm font-semibold">
              {pet?.name ?? 'Pet'}
            </h3>
            {adoption.status && (
              <Badge
                variant={STATUS_VARIANT[adoption.status] ?? 'outline'}
                className="shrink-0 text-xs"
              >
                {ADOPTION_STATUS_LABEL[adoption.status] ?? adoption.status}
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {pet?.species && (
              <Badge variant="outline" className="text-xs">
                {SPECIES_LABEL[pet.species] ?? pet.species}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between gap-2">
            {adoption.adoptedAt && (
              <time className="text-muted-foreground text-xs">
                Adotado em{' '}
                {new Date(adoption.adoptedAt).toLocaleDateString('pt-BR')}
              </time>
            )}

            {followUps.length > 0 && (
              <span className="text-muted-foreground text-xs">
                {FOLLOW_UP_STATUS_LABEL.APPROVED ?? 'Aprovado'}:{' '}
                {completedCount}/{followUps.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
