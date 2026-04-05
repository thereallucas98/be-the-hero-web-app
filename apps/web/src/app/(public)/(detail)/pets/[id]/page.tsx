import { ArrowLeft, Clock, Maximize2, User } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PetAdoptionRequirement } from '~/components/features/pets/pet-adoption-requirement'
import {
  DotIndicator,
  EnergyIndicator,
  PetAttributeCard,
} from '~/components/features/pets/pet-attribute-card'
import { PetDetailClient } from '~/components/features/pets/pet-detail-client'
import { PetImageGallery } from '~/components/features/pets/pet-image-gallery'
import { PetMapBlock } from '~/components/features/pets/pet-map-block'
import { WorkspaceContactCard } from '~/components/features/pets/workspace-contact-card'
import { LogoIcon } from '~/components/ui/logo'
import { Separator } from '~/components/ui/separator'
import { getServerPrincipal } from '~/lib/get-server-principal'
import {
  adoptionInterestRepository,
  petRepository,
} from '~/server/repositories'
import { getPetDetail } from '~/server/use-cases'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIZE_LABEL: Record<string, string> = {
  SMALL: 'Pequenino',
  MEDIUM: 'Médio',
  LARGE: 'Grande',
}

const SIZE_FILLED: Record<string, number> = {
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
}

const ENERGY_LABEL: Record<string, string> = {
  LOW: 'Pouca energia',
  MEDIUM: 'Energia moderada',
  HIGH: 'Muita energia',
}

const ENV_LABEL: Record<string, string> = {
  HOUSE: 'Ambiente amplo',
  APARTMENT: 'Ambiente fechado',
  BOTH: 'Ambos os ambientes',
}

const INDEPENDENCE_LABEL: Record<string, string> = {
  LOW: 'Baixa independência',
  MEDIUM: 'Independência média',
  HIGH: 'Alta independência',
}

const INDEPENDENCE_FILLED: Record<string, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
}

const AGE_LABEL: Record<string, string> = {
  PUPPY: 'Filhote',
  YOUNG: 'Jovem',
  ADULT: 'Adulto',
  SENIOR: 'Idoso',
}

const SEX_LABEL: Record<string, string> = {
  MALE: 'Macho',
  FEMALE: 'Fêmea',
}

function buildWhatsAppUrl(raw: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  return `https://wa.me/55${digits}`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = await params
  const [result, principal] = await Promise.all([
    getPetDetail(petRepository, id),
    getServerPrincipal(),
  ])

  if (!result.success) notFound()

  const { pet } = result

  const alreadyInterested =
    principal?.role === 'GUARDIAN'
      ? await adoptionInterestRepository.existsByUserAndPet(
          principal.userId,
          pet.id,
        )
      : false
  const waUrl = buildWhatsAppUrl(pet.workspace.whatsapp ?? pet.workspace.phone)
  const energyLevel = pet.energyLevel as 'LOW' | 'MEDIUM' | 'HIGH' | null
  const independenceLevel = pet.independenceLevel as
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | null
  const sizeLabel = SIZE_LABEL[pet.size] ?? pet.size
  const sizeFilled = SIZE_FILLED[pet.size] ?? 1

  return (
    <div className="bg-background flex min-h-dvh">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="bg-brand-primary sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center justify-between py-8 lg:flex xl:w-24">
        {/* Logo */}
        <Link href="/" aria-label="Voltar à página inicial">
          <LogoIcon className="size-10 text-white xl:size-11" />
        </Link>

        {/* Back button */}
        <Link
          href="/pets"
          aria-label="Voltar para listagem de animais"
          className="bg-accent-yellow flex size-12 items-center justify-center rounded-[15px] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ArrowLeft className="size-5 text-white" aria-hidden />
        </Link>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 lg:py-10">
        {/* Mobile back + breadcrumb */}
        <div className="mb-4 flex w-full max-w-[700px] items-center gap-3 lg:hidden">
          <Link
            href="/pets"
            aria-label="Voltar para listagem de animais"
            className="bg-brand-primary focus-visible:ring-brand-primary flex size-10 shrink-0 items-center justify-center rounded-[12px] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 text-white" aria-hidden />
          </Link>
          <p className="font-nunito text-accent-navy/50 text-[14px] font-semibold">
            Seu novo amigo
          </p>
        </div>

        {/* Desktop breadcrumb */}
        <p className="font-nunito text-accent-navy/40 mb-4 hidden text-[16px] font-semibold lg:block">
          Seu novo amigo
        </p>

        {/* White card */}
        <div className="w-full max-w-[700px] overflow-hidden rounded-[20px] bg-white shadow-sm">
          {/* Photo gallery */}
          <PetImageGallery images={pet.images} petName={pet.name} />

          <div className="px-5 pt-5 pb-8 sm:px-7 sm:pt-6">
            {/* Pet name + description */}
            <h1 className="font-nunito text-accent-navy text-[36px] leading-tight font-extrabold tracking-tight sm:text-[44px]">
              {pet.name}
            </h1>
            <p className="font-nunito text-accent-navy/80 mt-2 text-[15px] leading-relaxed font-semibold sm:text-[17px]">
              {pet.description}
            </p>

            {/* Attribute cards — row 1 */}
            <div className="mt-6 flex gap-3 sm:gap-4">
              {energyLevel && (
                <PetAttributeCard
                  label={ENERGY_LABEL[energyLevel] ?? 'Energia'}
                  icon={<EnergyIndicator level={energyLevel} />}
                />
              )}
              {pet.environment && (
                <PetAttributeCard
                  label={ENV_LABEL[pet.environment] ?? pet.environment}
                  icon={
                    <Maximize2
                      className="text-accent-navy size-5"
                      aria-hidden
                    />
                  }
                />
              )}
              <PetAttributeCard
                label={sizeLabel}
                icon={<DotIndicator filled={sizeFilled} />}
              />
            </div>

            {/* Attribute cards — row 2 */}
            <div className="mt-3 flex gap-3 sm:gap-4">
              {independenceLevel && (
                <PetAttributeCard
                  label={
                    INDEPENDENCE_LABEL[independenceLevel] ?? 'Independência'
                  }
                  icon={
                    <DotIndicator
                      filled={INDEPENDENCE_FILLED[independenceLevel] ?? 1}
                    />
                  }
                />
              )}
              <PetAttributeCard
                label={AGE_LABEL[pet.ageCategory] ?? pet.ageCategory}
                icon={<Clock className="text-accent-navy size-5" aria-hidden />}
              />
              <PetAttributeCard
                label={SEX_LABEL[pet.sex] ?? pet.sex}
                icon={<User className="text-accent-navy size-5" aria-hidden />}
              />
            </div>

            <Separator className="my-6" />

            {/* Map */}
            <PetMapBlock query={pet.workspace.address} />

            <Separator className="my-6" />

            {/* Workspace contact */}
            <WorkspaceContactCard
              name={pet.workspace.name}
              address={pet.workspace.address}
              phone={pet.workspace.phone}
              whatsapp={pet.workspace.whatsapp}
            />

            <Separator className="my-6" />

            {/* Adoption requirements */}
            {pet.requirements.length > 0 && (
              <div className="flex flex-col gap-4">
                <h2 className="font-nunito text-accent-navy text-[20px] font-bold sm:text-[24px]">
                  Requisitos para adoção
                </h2>
                <div className="flex flex-col gap-3">
                  {pet.requirements.map((req) => (
                    <PetAdoptionRequirement key={req.id} title={req.title} />
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-6" />

            {/* CTA — WhatsApp + adopt interest */}
            <PetDetailClient
              petId={pet.id}
              waUrl={waUrl}
              userRole={principal?.role ?? null}
              alreadyInterested={alreadyInterested}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
