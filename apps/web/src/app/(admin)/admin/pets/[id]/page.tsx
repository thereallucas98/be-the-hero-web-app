'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, PawPrint, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'
import { api } from '~/lib/api-client'

const SPECIES_LABEL: Record<string, string> = {
  DOG: 'Cachorro',
  CAT: 'Gato',
  BIRD: 'Pássaro',
  RABBIT: 'Coelho',
  OTHER: 'Outro',
}

interface PetDetail {
  id: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  energyLevel: string | null
  independenceLevel: string | null
  environment: string | null
  adoptionRequirements: string | null
  images: Array<{ id: string; url: string; isCover: boolean }>
  requirements: Array<{
    id: string
    category: string
    title: string
    description: string
    isMandatory: boolean
  }>
  workspace: {
    id: string
    name: string
    phone: string | null
    whatsapp: string | null
  }
}

interface PetDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminPetDetailPage({ params }: PetDetailPageProps) {
  const { id } = use(params)
  const [rejectOpen, setRejectOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: pet, isLoading } = useQuery({
    queryKey: ['adminPetDetail', id],
    queryFn: () => api.get<PetDetail>(`/api/pets/${id}`),
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/admin/pets/${id}/approve`)
    },
    onSuccess: () => {
      toast.success('Pet aprovado')
      queryClient.invalidateQueries({ queryKey: ['adminPets'] })
      queryClient.invalidateQueries({ queryKey: ['adminPetDetail', id] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (reviewNote: string) => {
      await api.post(`/api/admin/pets/${id}/reject`, { reviewNote })
    },
    onSuccess: () => {
      setRejectOpen(false)
      toast.success('Pet rejeitado')
      queryClient.invalidateQueries({ queryKey: ['adminPets'] })
      queryClient.invalidateQueries({ queryKey: ['adminPetDetail', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="bg-muted mt-6 h-64 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">Pet não encontrado.</p>
      </div>
    )
  }

  const coverImage = pet.images.find((i) => i.isCover) ?? pet.images[0]

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <Link
        href="/admin/pets"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-6 inline-flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl">
          {coverImage ? (
            <img
              src={coverImage.url}
              alt={pet.name}
              className="size-full object-cover"
            />
          ) : (
            <PawPrint className="text-muted-foreground size-8" aria-hidden />
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-foreground text-xl font-bold">{pet.name}</h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {SPECIES_LABEL[pet.species] ?? pet.species}
            </Badge>
            <Badge variant="outline">{pet.sex}</Badge>
            <Badge variant="outline">{pet.size}</Badge>
            <Badge variant="outline">{pet.ageCategory}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            {pet.workspace.name}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="mb-8 flex gap-2">
        <Button
          variant="outline"
          className="border-green-600 text-green-600 hover:bg-green-50"
          onClick={() => approveMutation.mutate()}
          disabled={approveMutation.isPending}
        >
          <Check className="size-4" aria-hidden />
          Aprovar
        </Button>
        <Button
          variant="ghost"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setRejectOpen(true)}
        >
          <X className="size-4" aria-hidden />
          Rejeitar
        </Button>
      </div>

      {/* Description */}
      <section className="mb-6">
        <h2 className="text-foreground mb-2 text-sm font-semibold">
          Descrição
        </h2>
        <p className="text-foreground text-sm">{pet.description}</p>
      </section>

      {/* Attributes */}
      <section className="mb-6">
        <h2 className="text-foreground mb-2 text-sm font-semibold">
          Atributos
        </h2>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {pet.energyLevel && (
            <InfoItem label="Energia" value={pet.energyLevel} />
          )}
          {pet.independenceLevel && (
            <InfoItem label="Independência" value={pet.independenceLevel} />
          )}
          {pet.environment && (
            <InfoItem label="Ambiente" value={pet.environment} />
          )}
        </div>
      </section>

      {/* Images */}
      {pet.images.length > 0 && (
        <section className="mb-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">
            Fotos ({pet.images.length})
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {pet.images.map((img) => (
              <div
                key={img.id}
                className="bg-muted aspect-square overflow-hidden rounded-lg"
              >
                <img src={img.url} alt="" className="size-full object-cover" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Requirements */}
      {pet.requirements.length > 0 && (
        <section className="mb-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">
            Requisitos ({pet.requirements.length})
          </h2>
          <div className="flex flex-col gap-2">
            {pet.requirements.map((req) => (
              <div key={req.id} className="border-border rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">
                    {req.title}
                  </span>
                  {req.isMandatory && (
                    <Badge variant="destructive" className="text-xs">
                      Obrigatório
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {req.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={(reviewNote) => rejectMutation.mutate(reviewNote)}
        isSubmitting={rejectMutation.isPending}
        title="Rejeitar pet"
      />
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-sm">{value}</dd>
    </div>
  )
}
