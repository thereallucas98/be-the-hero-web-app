import Link from 'next/link'
import { LogoIcon } from '~/components/ui/logo'
import { PetStatusBadge } from '~/components/features/pets/pet-status-badge'
import { cn } from '~/lib/utils'

// ─── Label maps ───────────────────────────────────────────────────────────────

const SPECIES_LABEL: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  BIRD: 'Pássaro',
  RABBIT: 'Coelho',
  OTHER: 'Outro',
}

const SIZE_LABEL: Record<string, string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Médio',
  LARGE: 'Grande',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkspacePetCardProps {
  id: string
  workspaceId: string
  name: string
  species: string
  size: string
  status: string
  coverImage: { url: string } | null
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspacePetCard({
  id,
  workspaceId,
  name,
  species,
  size,
  status,
  coverImage,
  className,
}: WorkspacePetCardProps) {
  return (
    <Link
      href={`/workspaces/${workspaceId}/pets/${id}`}
      data-slot="workspace-pet-card"
      className={cn(
        'group focus-visible:ring-ring flex flex-col overflow-hidden rounded-[16px] bg-white shadow-sm transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    >
      {/* Cover image */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4/3' }}>
        {coverImage ? (
          <img
            src={coverImage.url}
            alt={name}
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="bg-brand-primary-pale flex size-full items-center justify-center">
            <LogoIcon className="text-brand-primary/30 size-10" />
          </div>
        )}
      </div>

      {/* Info row */}
      <div className="flex flex-col gap-1.5 p-3">
        <p className="font-nunito text-accent-navy truncate text-[15px] leading-tight font-extrabold">
          {name}
        </p>
        <p className="font-nunito text-muted-foreground text-[12px] font-semibold">
          {SPECIES_LABEL[species] ?? species} · {SIZE_LABEL[size] ?? size}
        </p>
        <PetStatusBadge status={status} className="self-start" />
      </div>
    </Link>
  )
}
