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

interface EmptyStateProps {
  title: string
  description?: string
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
  children,
  className,
}: EmptyStateProps) {
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
            src="/assets/illustrations/pet.svg"
            alt=""
            width={260}
            height={302}
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
