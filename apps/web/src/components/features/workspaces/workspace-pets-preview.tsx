import Link from 'next/link'
import { PetCard } from '~/components/features/pets/pet-card'

interface Pet {
  id: string
  name: string
  coverImage: string | null
}

interface WorkspacePetsPreviewProps {
  workspaceId: string
  pets: Pet[]
}

export function WorkspacePetsPreview({
  workspaceId,
  pets,
}: WorkspacePetsPreviewProps) {
  if (pets.length === 0) return null

  return (
    <div data-slot="workspace-pets-preview" className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-nunito text-accent-navy text-[20px] font-bold sm:text-[24px]">
          Animais disponíveis
        </h2>
        <Link
          href={`/pets?workspaceId=${workspaceId}`}
          className="font-nunito text-brand-primary focus-visible:ring-brand-primary text-[13px] font-semibold underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none sm:text-[14px]"
        >
          Ver todos
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {pets.map((pet) => (
          <PetCard
            key={pet.id}
            id={pet.id}
            name={pet.name}
            coverImage={pet.coverImage ? { url: pet.coverImage } : null}
          />
        ))}
      </div>
    </div>
  )
}
