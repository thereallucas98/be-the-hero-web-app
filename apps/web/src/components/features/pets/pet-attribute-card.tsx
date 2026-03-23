import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

interface PetAttributeCardProps {
  label: string
  icon: ReactNode
  className?: string
}

export function PetAttributeCard({
  label,
  icon,
  className,
}: PetAttributeCardProps) {
  return (
    <div
      data-slot="pet-attribute-card"
      className={cn(
        'border-accent-navy/10 flex flex-1 flex-col gap-2 rounded-[16px] border-2 px-4 py-4 sm:px-5',
        className,
      )}
    >
      <div className="flex items-center gap-0.5">{icon}</div>
      <p className="font-nunito text-accent-navy text-[14px] font-semibold sm:text-[16px]">
        {label}
      </p>
    </div>
  )
}

// ─── Indicator helpers ────────────────────────────────────────────────────────

/** 1–3 filled dots + remaining empty dots up to `total` */
export function DotIndicator({
  filled,
  total = 3,
}: {
  filled: number
  total?: number
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block size-3 rounded-full',
            i < filled ? 'bg-accent-navy' : 'border-accent-navy/40 border-2',
          )}
        />
      ))}
    </div>
  )
}

/** 1–3 filled zap-like "energy" bars */
export function EnergyIndicator({
  level,
}: {
  level: 'LOW' | 'MEDIUM' | 'HIGH'
}) {
  const count = level === 'LOW' ? 1 : level === 'MEDIUM' ? 2 : 3
  return (
    <div className="flex items-end gap-0.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'inline-block w-2 rounded-sm',
            i < count ? 'bg-accent-navy' : 'bg-accent-navy/20',
          )}
          style={{ height: `${10 + i * 4}px` }}
        />
      ))}
    </div>
  )
}
