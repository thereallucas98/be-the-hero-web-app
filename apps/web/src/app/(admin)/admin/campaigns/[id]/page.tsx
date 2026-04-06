'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, FileText, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'

interface CampaignDetail {
  id: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  status: string
  reviewNote: string | null
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  documents: Array<{ id: string; type: string; title: string; status: string }>
  workspace: { id: string; name: string }
  pet: { id: string; name: string } | null
}

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminCampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id } = use(params)
  const [rejectOpen, setRejectOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['adminCampaignDetail', id],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${id}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao carregar campanha')
      return res.json() as Promise<CampaignDetail>
    },
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/campaigns/${id}/approve`, {
        method: 'POST',
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao aprovar')
    },
    onSuccess: () => {
      toast.success('Campanha aprovada')
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] })
      queryClient.invalidateQueries({
        queryKey: ['adminCampaignDetail', id],
      })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (reviewNote: string) => {
      const res = await fetch(`/api/admin/campaigns/${id}/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNote }),
      })
      if (!res.ok) throw new Error('Erro ao rejeitar')
    },
    onSuccess: () => {
      setRejectOpen(false)
      toast.success('Campanha rejeitada')
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] })
      queryClient.invalidateQueries({
        queryKey: ['adminCampaignDetail', id],
      })
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

  if (!campaign) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">
          Campanha não encontrada.
        </p>
      </div>
    )
  }

  const goal = Number(campaign.goalAmount)
  const current = Number(campaign.currentAmount)
  const percent =
    goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
  const isPendingReview = campaign.status === 'PENDING_REVIEW'

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <Link
        href="/admin/campaigns"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-6 inline-flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-foreground text-xl font-bold">{campaign.title}</h1>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="outline">{campaign.status}</Badge>
          <span className="text-muted-foreground text-sm">
            {campaign.workspace.name}
          </span>
          {campaign.pet && (
            <span className="text-muted-foreground text-sm">
              • Pet: {campaign.pet.name}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      {isPendingReview && (
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
      )}

      {/* Review note */}
      {campaign.reviewNote && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-lg p-3 text-sm">
          <strong>Nota da revisão:</strong> {campaign.reviewNote}
        </div>
      )}

      {/* Description */}
      <section className="mb-6">
        <h2 className="text-foreground mb-2 text-sm font-semibold">
          Descrição
        </h2>
        <p className="text-foreground text-sm">{campaign.description}</p>
      </section>

      {/* Progress */}
      <section className="mb-6">
        <h2 className="text-foreground mb-2 text-sm font-semibold">
          Progresso
        </h2>
        <ProgressPrimitive.Root className="bg-muted relative h-3 w-full overflow-hidden rounded-full">
          <ProgressPrimitive.Indicator
            className="bg-primary h-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </ProgressPrimitive.Root>
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-foreground font-medium">
            {current.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </span>
          <span className="text-muted-foreground">
            de{' '}
            {goal.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}{' '}
            ({percent}%)
          </span>
        </div>
      </section>

      {/* Dates */}
      <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
        <InfoItem
          label="Criada em"
          value={new Date(campaign.createdAt).toLocaleDateString('pt-BR')}
        />
        {campaign.startsAt && (
          <InfoItem
            label="Início"
            value={new Date(campaign.startsAt).toLocaleDateString('pt-BR')}
          />
        )}
        {campaign.endsAt && (
          <InfoItem
            label="Encerramento"
            value={new Date(campaign.endsAt).toLocaleDateString('pt-BR')}
          />
        )}
      </div>

      {/* Documents */}
      <section className="mb-6">
        <h2 className="text-foreground mb-2 text-sm font-semibold">
          Documentos ({campaign.documents.length})
        </h2>
        {campaign.documents.length === 0 ? (
          <p className="text-muted-foreground text-xs">
            Nenhum documento anexado.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {campaign.documents.map((doc) => (
              <div
                key={doc.id}
                className="border-border flex items-center gap-3 rounded-lg border p-3"
              >
                <FileText
                  className="text-muted-foreground size-4 shrink-0"
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">
                    {doc.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{doc.type}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {doc.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </section>

      <RejectDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onConfirm={(reviewNote) => rejectMutation.mutate(reviewNote)}
        isSubmitting={rejectMutation.isPending}
        title="Rejeitar campanha"
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
