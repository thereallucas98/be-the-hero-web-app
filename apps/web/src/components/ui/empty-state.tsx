import type { ReactNode } from 'react'
import Image from 'next/image'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '~/components/ui/empty'
import { cn } from '~/lib/utils'

export type EmptyIllustration = 'pet' | 'cat-lonely' | 'dog-lonely'

const ILLUSTRATION_MAP: Record<
  EmptyIllustration,
  { src: string; width: number; height: number }
> = {
  pet: { src: '/assets/illustrations/pet.svg', width: 260, height: 302 },
  'cat-lonely': {
    src: '/assets/illustrations/cat-lonely.svg',
    width: 260,
    height: 100,
  },
  'dog-lonely': {
    src: '/assets/illustrations/dog-lonely.svg',
    width: 260,
    height: 142,
  },
}

interface EmptyStateProps {
  title: string
  description?: string
  /** Which illustration to show. Defaults to `"pet"`. */
  illustration?: EmptyIllustration
  /** Action buttons or links rendered below the description */
  children?: ReactNode
  className?: string
}

/**
 * Branded empty state with the BeTheHero pet illustration.
 * Drop-in replacement for inline "no results" text blocks.
 *
 * @example
 * <EmptyState title="Nenhum animal encontrado" description="Tente ajustar os filtros.">
 *   <Button onClick={clearFilters}>Limpar filtros</Button>
 * </EmptyState>
 */
export function EmptyState({
  title,
  description,
  illustration = 'pet',
  children,
  className,
}: EmptyStateProps) {
  const img = ILLUSTRATION_MAP[illustration]

  return (
    <Empty
      className={cn(
        'border-brand-primary/20 bg-brand-primary-pale/40',
        className,
      )}
    >
      <EmptyHeader>
        <EmptyMedia>
          <Image
            src={img.src}
            alt=""
            width={img.width}
            height={img.height}
            priority={false}
            className="h-auto w-[160px] sm:w-[200px] md:w-[260px]"
          />
        </EmptyMedia>

        <EmptyTitle className="font-nunito text-accent-navy text-[18px] font-extrabold tracking-tight sm:text-[20px]">
          {title}
        </EmptyTitle>

        {description && (
          <EmptyDescription className="font-nunito text-accent-navy/60 text-sm sm:text-base">
            {description}
          </EmptyDescription>
        )}
      </EmptyHeader>

      {children && <EmptyContent>{children}</EmptyContent>}
    </Empty>
  )
}
