'use client'

import type { ComponentProps } from 'react'
import { PawPrint, User } from 'lucide-react'
import { cn } from '~/lib/utils'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'

const SPECIES_LABEL: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  BIRD: 'Pássaro',
  RABBIT: 'Coelho',
  OTHER: 'Outro',
}

export interface WorkspaceInterestItem {
  id: string
  message: string | null
  createdAt: string
  pet: {
    id: string
    name: string
    species: string
    sex: string
    size: string
    ageCategory: string
  }
  user: {
    id: string
    fullName: string
    email: string
  }
}

interface WorkspaceInterestCardProps extends ComponentProps<'div'> {
  interest: WorkspaceInterestItem
  onDismiss: (interestId: string) => void
  onConvert: (interest: WorkspaceInterestItem) => void
  isDismissing?: boolean
}

export function WorkspaceInterestCard({
  interest,
  onDismiss,
  onConvert,
  isDismissing,
  className,
  ...props
}: WorkspaceInterestCardProps) {
  return (
    <div
      data-slot="workspace-interest-card"
      className={cn(
        'border-border bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-start',
        className,
      )}
      {...props}
    >
      {/* Pet info */}
      <div className="flex items-center gap-3">
        <div className="bg-muted flex size-12 shrink-0 items-center justify-center rounded-lg">
          <PawPrint className="text-muted-foreground size-5" aria-hidden />
        </div>
        <div>
          <h3 className="text-foreground text-sm font-semibold">
            {interest.pet.name}
          </h3>
          <Badge variant="outline" className="mt-0.5 text-xs">
            {SPECIES_LABEL[interest.pet.species] ?? interest.pet.species}
          </Badge>
        </div>
      </div>

      {/* Guardian info + message */}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-center gap-1.5">
          <User className="text-muted-foreground size-3.5" aria-hidden />
          <span className="text-foreground text-sm font-medium">
            {interest.user.fullName}
          </span>
          <span className="text-muted-foreground hidden text-xs sm:inline">
            ({interest.user.email})
          </span>
        </div>

        {interest.message && (
          <p className="text-muted-foreground line-clamp-2 text-xs">
            &quot;{interest.message}&quot;
          </p>
        )}

        <time className="text-muted-foreground text-xs">
          {new Date(interest.createdAt).toLocaleDateString('pt-BR')}
        </time>
      </div>

      {/* Actions */}
      <div className="flex shrink-0 gap-2 sm:flex-col">
        <Button size="sm" onClick={() => onConvert(interest)}>
          Converter
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive"
          onClick={() => onDismiss(interest.id)}
          disabled={isDismissing}
        >
          Dispensar
        </Button>
      </div>
    </div>
  )
}
