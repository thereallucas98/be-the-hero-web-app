'use client'

import type { ComponentProps } from 'react'
import { PawPrint, X } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { CHANNEL_LABEL, SPECIES_LABEL } from './guardian-labels'

interface InterestCardProps extends ComponentProps<'div'> {
  interest: {
    id: string | null
    message: string | null
    channel: string | null
    createdAt: string | null
    pet: {
      id: string | null
      name: string | null
      species: string | null
      sex: string | null
      size: string | null
      ageCategory: string | null
      coverImage: { url: string | null } | null
    } | null
  }
  onWithdraw: (interestId: string) => void
  isWithdrawing?: boolean
}

export function InterestCard({
  interest,
  onWithdraw,
  isWithdrawing,
  className,
  ...props
}: InterestCardProps) {
  const pet = interest.pet

  return (
    <div
      data-slot="interest-card"
      className={cn(
        'border-border bg-card flex items-start gap-4 rounded-xl border p-4 shadow-sm',
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
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive size-8 shrink-0"
            aria-label="Retirar interesse"
            onClick={() => interest.id && onWithdraw(interest.id)}
            disabled={isWithdrawing}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {pet?.species && (
            <Badge variant="secondary" className="text-xs">
              {SPECIES_LABEL[pet.species] ?? pet.species}
            </Badge>
          )}
          {interest.channel && (
            <Badge variant="outline" className="text-xs">
              {CHANNEL_LABEL[interest.channel] ?? interest.channel}
            </Badge>
          )}
        </div>

        {interest.message && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            {interest.message}
          </p>
        )}

        {interest.createdAt && (
          <time className="text-muted-foreground text-xs">
            {new Date(interest.createdAt).toLocaleDateString('pt-BR')}
          </time>
        )}
      </div>
    </div>
  )
}
