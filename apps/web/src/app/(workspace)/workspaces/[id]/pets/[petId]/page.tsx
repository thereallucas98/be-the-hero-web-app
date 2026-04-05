import { notFound, redirect } from 'next/navigation'
import { PetImageManager } from '~/components/features/pets/pet-image-manager'
import { PetRequirementManager } from '~/components/features/pets/pet-requirement-manager'
import { PetStatusBadge } from '~/components/features/pets/pet-status-badge'
import { SubmitForReviewButton } from '~/components/features/pets/submit-for-review-button'
import { getServerPrincipal } from '~/lib/get-server-principal'
import { petRepository, workspaceRepository } from '~/server/repositories'
import { getWorkspaceById, getWorkspacePetDetail } from '~/server/use-cases'

// ─── Label maps ───────────────────────────────────────────────────────────────

const SPECIES_LABEL: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  RABBIT: 'Coelho',
  BIRD: 'Pássaro',
  HORSE: 'Cavalo',
  COW: 'Vaca',
  GOAT: 'Cabra',
  PIG: 'Porco',
  TURTLE: 'Tartaruga',
  OTHER: 'Outro',
}
const SEX_LABEL: Record<string, string> = { MALE: 'Macho', FEMALE: 'Fêmea' }
const AGE_LABEL: Record<string, string> = {
  PUPPY: 'Filhote',
  YOUNG: 'Jovem',
  ADULT: 'Adulto',
  SENIOR: 'Idoso',
}
const SIZE_LABEL: Record<string, string> = {
  SMALL: 'Pequeno',
  MEDIUM: 'Médio',
  LARGE: 'Grande',
}
const ENERGY_LABEL: Record<string, string> = {
  LOW: 'Baixo',
  MEDIUM: 'Médio',
  HIGH: 'Alto',
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ id: string; petId: string }>
}

export default async function WorkspacePetDetailPage({ params }: Props) {
  const { id, petId } = await params

  const principal = await getServerPrincipal()
  if (!principal) redirect('/login')

  // Verify workspace access
  const wsResult = await getWorkspaceById(workspaceRepository, principal, {
    id,
    membersPage: 1,
    membersPerPage: 1,
  })
  if (!wsResult.success) {
    if (wsResult.code === 'NOT_FOUND') notFound()
    redirect('/login')
  }

  // Fetch pet detail (workspace-scoped)
  const petResult = await getWorkspacePetDetail(petRepository, {
    petId,
    workspaceId: id,
  })
  if (!petResult.success) notFound()

  const { pet } = petResult

  return (
    <div className="flex flex-col gap-6 p-8">
      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-nunito text-accent-navy text-[32px] leading-none font-extrabold">
              {pet.name}
            </h1>
            <PetStatusBadge status={pet.status} />
          </div>
          <p className="font-nunito text-accent-navy/50 mt-1 text-[15px]">
            {SPECIES_LABEL[pet.species] ?? pet.species}
            {' · '}
            {SEX_LABEL[pet.sex] ?? pet.sex}
            {' · '}
            {AGE_LABEL[pet.ageCategory] ?? pet.ageCategory}
            {' · '}
            {SIZE_LABEL[pet.size] ?? pet.size}
            {pet.energyLevel
              ? ` · Energia ${ENERGY_LABEL[pet.energyLevel]}`
              : ''}
          </p>
        </div>

        <SubmitForReviewButton
          petId={petId}
          status={pet.status}
          imageCount={pet.images.length}
        />
      </div>

      {/* ── Images ──────────────────────────────────────────────────── */}
      <section className="rounded-[20px] border border-[#d3e2e5] bg-white p-6">
        <h2 className="font-nunito text-accent-navy mb-4 text-[18px] font-extrabold">
          Fotos
          <span className="text-accent-navy/40 ml-2 text-[14px] font-semibold">
            {pet.images.length}/5
          </span>
        </h2>
        <PetImageManager petId={petId} initialImages={pet.images} />
      </section>

      {/* ── Requirements ────────────────────────────────────────────── */}
      <section className="rounded-[20px] border border-[#d3e2e5] bg-white p-6">
        <h2 className="font-nunito text-accent-navy mb-4 text-[18px] font-extrabold">
          Requisitos para adoção
          <span className="text-accent-navy/40 ml-2 text-[14px] font-semibold">
            {pet.requirements.length}
          </span>
        </h2>
        <PetRequirementManager
          petId={petId}
          initialRequirements={pet.requirements}
        />
      </section>

      {/* ── Description ─────────────────────────────────────────────── */}
      <section className="rounded-[20px] border border-[#d3e2e5] bg-white p-6">
        <h2 className="font-nunito text-accent-navy mb-3 text-[18px] font-extrabold">
          Sobre
        </h2>
        <p className="font-nunito text-accent-navy/70 text-[15px] leading-relaxed">
          {pet.description}
        </p>
      </section>
    </div>
  )
}
