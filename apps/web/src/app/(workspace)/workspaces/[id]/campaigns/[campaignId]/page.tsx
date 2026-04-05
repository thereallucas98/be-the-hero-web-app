'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  CampaignFormDialog,
  type CampaignFormData,
} from '~/components/features/workspaces/campaign-form-dialog'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  CLOSED: 'Encerrada',
}

const STATUS_VARIANT: Record<
  string,
  'default' | 'secondary' | 'destructive' | 'outline' | 'warning'
> = {
  DRAFT: 'outline',
  PENDING_REVIEW: 'warning',
  APPROVED: 'default',
  REJECTED: 'destructive',
  CLOSED: 'secondary',
}

interface CampaignDetail {
  id: string
  workspaceId: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  status: string
  reviewNote: string | null
  startsAt: string | null
  endsAt: string | null
  createdAt: string
  documents: Array<{ id: string; type: string; title: string; status: string }>
  workspace: { id: string; name: string }
  pet: { id: string; name: string } | null
}

interface DonationItem {
  id: string
  amount: string
  donorName: string
  donorEmail: string
  status: string
  createdAt: string
}

interface DonationsResponse {
  items: DonationItem[]
  total: number
  page: number
  perPage: number
}

interface CampaignDetailPageProps {
  params: Promise<{ id: string; campaignId: string }>
}

export default function CampaignDetailPage({
  params,
}: CampaignDetailPageProps) {
  const { id: workspaceId, campaignId } = use(params)
  const [editOpen, setEditOpen] = useState(false)
  const [donationsPage, setDonationsPage] = useState(1)
  const queryClient = useQueryClient()

  // ─── Campaign detail ─────────────────────────────────────────────────────────
  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao carregar campanha')
      return res.json() as Promise<CampaignDetail>
    },
  })

  // ─── Donations ───────────────────────────────────────────────────────────────
  const { data: donations } = useQuery({
    queryKey: ['campaignDonations', campaignId, donationsPage],
    queryFn: async () => {
      const res = await fetch(
        `/api/campaigns/${campaignId}/donations?page=${donationsPage}&perPage=10`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Erro ao carregar doações')
      return res.json() as Promise<DonationsResponse>
    },
    enabled: !!campaign,
  })

  // ─── Edit mutation ───────────────────────────────────────────────────────────
  const editMutation = useMutation({
    mutationFn: async (data: CampaignFormData) => {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao atualizar campanha')
      }
    },
    onSuccess: () => {
      setEditOpen(false)
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['workspaceCampaigns'] })
    },
    meta: { successMessage: 'Campanha atualizada' },
  })

  // ─── Submit for review ───────────────────────────────────────────────────────
  const submitMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/campaigns/${campaignId}/submit-for-review`,
        { method: 'POST', credentials: 'include' },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao submeter para revisão')
      }
    },
    onSuccess: () => {
      toast.success('Campanha submetida para revisão')
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] })
      queryClient.invalidateQueries({ queryKey: ['workspaceCampaigns'] })
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
  const isDraft = campaign.status === 'DRAFT'
  const hasDocs = campaign.documents.length > 0
  const donationItems = donations?.items ?? []
  const donationTotal = donations?.total ?? 0
  const donationTotalPages = Math.ceil(donationTotal / 10)

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      {/* Back */}
      <Link
        href={`/workspaces/${workspaceId}/campaigns`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-6 inline-flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-foreground text-xl font-bold">
            {campaign.title}
          </h1>
          {campaign.pet && (
            <p className="text-muted-foreground mt-1 text-sm">
              Pet: {campaign.pet.name}
            </p>
          )}
        </div>
        <Badge variant={STATUS_VARIANT[campaign.status] ?? 'outline'}>
          {STATUS_LABEL[campaign.status] ?? campaign.status}
        </Badge>
      </div>

      {/* Description */}
      <p className="text-foreground mb-6 text-sm">{campaign.description}</p>

      {/* Review note */}
      {campaign.reviewNote && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-lg p-3 text-sm">
          <strong>Nota da revisão:</strong> {campaign.reviewNote}
        </div>
      )}

      {/* Progress */}
      <div className="mb-6 flex flex-col gap-2">
        <ProgressPrimitive.Root className="bg-muted relative h-3 w-full overflow-hidden rounded-full">
          <ProgressPrimitive.Indicator
            className="bg-primary h-full transition-all"
            style={{ width: `${percent}%` }}
          />
        </ProgressPrimitive.Root>
        <div className="flex items-center justify-between text-sm">
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
      </div>

      {/* Actions */}
      {isDraft && (
        <div className="mb-8 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditOpen(true)}>
            Editar
          </Button>
          <Button
            size="sm"
            onClick={() => submitMutation.mutate()}
            disabled={submitMutation.isPending || !hasDocs}
            title={
              !hasDocs
                ? 'Adicione ao menos um documento antes de submeter'
                : undefined
            }
          >
            {submitMutation.isPending
              ? 'Submetendo...'
              : 'Submeter para revisão'}
          </Button>
        </div>
      )}

      {/* Documents */}
      <section className="mb-8">
        <h2 className="text-foreground mb-3 text-lg font-semibold">
          Documentos
        </h2>
        {campaign.documents.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed p-6 text-center">
            <FileText className="text-muted-foreground size-8" aria-hidden />
            <p className="text-muted-foreground text-xs">
              Nenhum documento anexado. Adicione documentos via API para
              submeter para revisão.
            </p>
          </div>
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

      {/* Donations */}
      <section>
        <h2 className="text-foreground mb-3 text-lg font-semibold">
          Doações {donationTotal > 0 && `(${donationTotal})`}
        </h2>
        {donationItems.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Nenhuma doação registrada.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {donationItems.map((donation) => (
                <div
                  key={donation.id}
                  className="border-border flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-foreground text-sm font-medium">
                      {donation.donorName}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(donation.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground text-sm font-semibold">
                      {Number(donation.amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {donation.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {donationTotalPages > 1 && (
              <div className="mt-4 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={donationsPage <= 1}
                  onClick={() => setDonationsPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <span className="text-muted-foreground text-sm">
                  {donationsPage} de {donationTotalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={donationsPage >= donationTotalPages}
                  onClick={() => setDonationsPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {/* Edit dialog */}
      {isDraft && (
        <CampaignFormDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          onSubmit={(data) => editMutation.mutate(data)}
          isSubmitting={editMutation.isPending}
          defaultValues={{
            title: campaign.title,
            description: campaign.description,
            goalAmount: goal,
          }}
          mode="edit"
        />
      )}
    </div>
  )
}
