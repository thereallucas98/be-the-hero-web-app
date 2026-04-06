'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, Megaphone, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'
import { api } from '~/lib/api-client'
import { cn } from '~/lib/utils'

const STATUS_TABS = [
  { value: 'PENDING_REVIEW', label: 'Em revisão' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
]

interface CampaignItem {
  id: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  status: string
  createdAt: string
}

interface CampaignsResponse {
  items: CampaignItem[]
  total: number
  page: number
  perPage: number
}

export default function AdminCampaignsPage() {
  const [status, setStatus] = useState('PENDING_REVIEW')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const perPage = 20
  const queryClient = useQueryClient()
  const queryKey = ['adminCampaigns', status, page]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api.get<CampaignsResponse>(
        `/api/admin/campaigns?status=${status}&page=${page}&perPage=${perPage}`,
      ),
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/campaigns/${id}/approve`)
    },
    onSuccess: () => {
      toast.success('Campanha aprovada')
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async ({
      id,
      reviewNote,
    }: {
      id: string
      reviewNote: string
    }) => {
      await api.post(`/api/admin/campaigns/${id}/reject`, { reviewNote })
    },
    onSuccess: () => {
      setRejectTarget(null)
      toast.success('Campanha rejeitada')
      queryClient.invalidateQueries({ queryKey: ['adminCampaigns'] })
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Campanhas</h1>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={cn(
              'focus-visible:ring-ring cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
              status === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-20 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Megaphone className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhuma campanha encontrada.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((campaign) => (
              <div
                key={campaign.id}
                className="border-border bg-card flex items-center justify-between gap-4 rounded-xl border p-4 shadow-sm"
              >
                <Link
                  href={`/admin/campaigns/${campaign.id}`}
                  className="min-w-0 flex-1"
                >
                  <h3 className="text-foreground text-sm font-semibold hover:underline">
                    {campaign.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 line-clamp-1 text-xs">
                    {campaign.description}
                  </p>
                  <span className="text-muted-foreground text-xs">
                    Meta:{' '}
                    {Number(campaign.goalAmount).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    })}
                  </span>
                </Link>
                {status === 'PENDING_REVIEW' && (
                  <div className="flex shrink-0 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-green-600 text-green-600 hover:bg-green-50"
                      onClick={() => approveMutation.mutate(campaign.id)}
                      disabled={approveMutation.isPending}
                    >
                      <Check className="size-4" aria-hidden />
                      Aprovar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setRejectTarget(campaign.id)}
                    >
                      <X className="size-4" aria-hidden />
                      Rejeitar
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground text-sm">
                {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      <RejectDialog
        open={!!rejectTarget}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        onConfirm={(reviewNote) =>
          rejectTarget &&
          rejectMutation.mutate({ id: rejectTarget, reviewNote })
        }
        isSubmitting={rejectMutation.isPending}
        title="Rejeitar campanha"
      />
    </div>
  )
}
