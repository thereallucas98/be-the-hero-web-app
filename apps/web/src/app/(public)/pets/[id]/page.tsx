import { ArrowLeft, Maximize2 } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PetAdoptionRequirement } from '~/components/features/pets/pet-adoption-requirement'
import {
  DotIndicator,
  EnergyIndicator,
  PetAttributeCard,
} from '~/components/features/pets/pet-attribute-card'
import { PetImageGallery } from '~/components/features/pets/pet-image-gallery'
import { PetMapBlock } from '~/components/features/pets/pet-map-block'
import { WorkspaceContactCard } from '~/components/features/pets/workspace-contact-card'
import { LogoIcon } from '~/components/ui/logo'
import { Separator } from '~/components/ui/separator'
import { petRepository } from '~/server/repositories'
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
  const result = await getPetDetail(petRepository, id)

  if (!result.success) notFound()

  const { pet } = result
  const waUrl = buildWhatsAppUrl(pet.workspace.whatsapp ?? pet.workspace.phone)
  const energyLevel = pet.energyLevel as 'LOW' | 'MEDIUM' | 'HIGH' | null
  const sizeLabel = SIZE_LABEL[pet.size] ?? pet.size
  const sizeFilled = SIZE_FILLED[pet.size] ?? 1

  return (
    <div className="bg-brand-primary-pale flex min-h-dvh">
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

            {/* Attribute cards */}
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

            {/* CTA */}
            {waUrl ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-nunito flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#3cdc8c] py-4 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3cdc8c] focus-visible:outline-none sm:py-5 sm:text-[18px]"
              >
                {/* WhatsApp icon */}
                <svg
                  viewBox="0 0 24 24"
                  className="size-5 fill-white"
                  aria-hidden
                >
                  <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.765.463 3.423 1.27 4.87L2 22l5.264-1.246A9.958 9.958 0 0 0 12.004 22C17.525 22 22 17.525 22 12.004 22 6.479 17.525 2 12.004 2Zm5.77 13.944c-.243.684-1.204 1.252-1.97 1.418-.524.112-1.208.2-3.51-.753-2.944-1.198-4.839-4.186-4.986-4.38-.142-.195-1.191-1.584-1.191-3.022 0-1.438.751-2.141 1.018-2.435.243-.268.528-.336.705-.336l.508.01c.163.007.38-.062.595.454.222.53.754 1.835.82 1.969.067.133.11.29.022.466-.086.177-.13.287-.258.44-.13.153-.272.342-.388.46-.13.128-.265.267-.114.523.151.255.672 1.11 1.444 1.797.992.886 1.829 1.16 2.086 1.294.257.133.407.111.558-.067.151-.177.648-.756.82-1.014.171-.258.343-.214.578-.129.236.085 1.499.708 1.756.836.257.13.428.193.49.3.063.11.063.635-.18 1.32Z" />
                </svg>
                Entrar em contato
              </a>
            ) : (
              <div className="font-nunito bg-accent-navy/10 text-accent-navy/50 flex w-full items-center justify-center rounded-[20px] py-4 text-[16px] font-semibold">
                Contato não disponível
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
