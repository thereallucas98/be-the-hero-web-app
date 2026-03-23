import Link from 'next/link'
import { LogoIcon } from '~/components/ui/logo'
import { cn } from '~/lib/utils'

interface PetCardProps {
  id: string
  name: string
  coverImage: { url: string } | null
  highlighted?: boolean
}

export function PetCard({
  id,
  name,
  coverImage,
  highlighted = false,
}: PetCardProps) {
  return (
    <Link
      href={`/pets/${id}`}
      data-slot="pet-card"
      className={cn(
        'group focus-visible:ring-ring relative block w-full overflow-hidden rounded-[16px] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:rounded-[20px]',
        highlighted ? 'bg-accent-navy' : 'bg-white',
      )}
    >
      {/* Photo — aspect ratio keeps proportions across all breakpoints */}
      <div
        className="bg-muted relative mx-[3px] mt-[3px] overflow-hidden rounded-[14px] sm:rounded-[18px]"
        style={{ aspectRatio: '274 / 135' }}
      >
        {coverImage ? (
          <img
            src={coverImage.url}
            alt={name}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="bg-brand-primary-pale size-full" />
        )}

        {/* Paw button */}
        <div
          className={cn(
            'absolute bottom-2 left-2 flex size-9 items-center justify-center rounded-[8px] border-2 border-white sm:size-11 sm:rounded-[10px] sm:border-[3px]',
            highlighted ? 'bg-brand-primary' : 'bg-accent-yellow',
          )}
          aria-hidden="true"
        >
          <LogoIcon className="size-3 text-white sm:size-[15px]" />
        </div>
      </div>

      {/* Name */}
      <p
        className={cn(
          'font-nunito py-2 text-center text-[14px] leading-[1.2] font-bold sm:py-[14px] sm:text-[18px]',
          highlighted ? 'text-white' : 'text-accent-navy',
        )}
      >
        {name}
      </p>
    </Link>
  )
}
