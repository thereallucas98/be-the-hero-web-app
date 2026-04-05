'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, PawPrint } from 'lucide-react'
import { useAdoption } from '~/graphql/hooks/use-adoption'
import { Badge } from '~/components/ui/badge'
import { FollowUpTimeline } from '~/components/features/guardian/follow-up-timeline'
import {
  ADOPTION_STATUS_LABEL,
  SPECIES_LABEL,
} from '~/components/features/guardian/guardian-labels'

interface AdoptionDetailPageProps {
  params: Promise<{ id: string }>
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline'
> = {
  ACTIVE: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'destructive',
}

export default function AdoptionDetailPage({
  params,
}: AdoptionDetailPageProps) {
  const { id } = use(params)
  const { data: adoption, isLoading } = useAdoption(id)

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted mt-6 h-64 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!adoption) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">Adoção não encontrada.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      {/* Back link */}
      <Link
        href="/guardian/adoptions"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-6 inline-flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-muted flex size-14 items-center justify-center rounded-lg">
            <PawPrint className="text-muted-foreground size-6" aria-hidden />
          </div>
          <div>
            <h1 className="text-foreground text-xl font-bold">
              {adoption.pet?.name ?? 'Pet'}
            </h1>
            <div className="flex items-center gap-1.5">
              {adoption.pet?.species && (
                <span className="text-muted-foreground text-sm">
                  {SPECIES_LABEL[adoption.pet.species] ?? adoption.pet.species}
                </span>
              )}
            </div>
          </div>
        </div>
        {adoption.status && (
          <Badge variant={STATUS_VARIANT[adoption.status] ?? 'outline'}>
            {ADOPTION_STATUS_LABEL[adoption.status] ?? adoption.status}
          </Badge>
        )}
      </div>

      {/* Info grid */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <InfoItem label="Organização" value={adoption.workspace?.name} />
        <InfoItem
          label="Data de adoção"
          value={
            adoption.adoptedAt
              ? new Date(adoption.adoptedAt).toLocaleDateString('pt-BR')
              : null
          }
        />
        {adoption.pet?.description && (
          <div className="sm:col-span-2">
            <InfoItem label="Sobre o pet" value={adoption.pet.description} />
          </div>
        )}
        {adoption.notes && (
          <div className="sm:col-span-2">
            <InfoItem label="Observações" value={adoption.notes} />
          </div>
        )}
      </div>

      {/* Follow-up timeline */}
      {adoption.followUps && adoption.followUps.length > 0 && (
        <section>
          <h2 className="text-foreground mb-4 text-lg font-semibold">
            Acompanhamentos
          </h2>
          <FollowUpTimeline followUps={adoption.followUps} />
        </section>
      )}
    </div>
  )
}

function InfoItem({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  if (!value) return null
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium">{label}</dt>
      <dd className="text-foreground mt-0.5 text-sm">{value}</dd>
    </div>
  )
}
