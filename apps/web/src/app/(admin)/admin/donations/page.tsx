'use client'

import { useState } from 'react'
import { Check, HandCoins, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'
import { api } from '~/lib/api-client'
import { cn } from '~/lib/utils'

const STATUS_TABS = [
  { value: 'PENDING_REVIEW', label: 'Pendentes' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
]

interface DonationItem {
  id: string
  amount: string
  currency: string
  donorName: string
  donorEmail: string
  paymentMethod: string
  proofUrl: string | null
  status: string
  reviewNote: string | null
  createdAt: string
}

interface DonationsResponse {
  items: DonationItem[]
  total: number
  page: number
  perPage: number
}

export default function AdminDonationsPage() {
  const [status, setStatus] = useState('PENDING_REVIEW')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const perPage = 20
  const queryClient = useQueryClient()
  const queryKey = ['adminDonations', status, page]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api.get<DonationsResponse>(
        `/api/admin/donations?status=${status}&page=${page}&perPage=${perPage}`,
      ),
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/donations/${id}/approve`)
    },
    onSuccess: () => {
      toast.success('Doação aprovada')
      queryClient.invalidateQueries({ queryKey: ['adminDonations'] })
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
      await api.post(`/api/admin/donations/${id}/reject`, { reviewNote })
    },
    onSuccess: () => {
      setRejectTarget(null)
      toast.success('Doação rejeitada')
      queryClient.invalidateQueries({ queryKey: ['adminDonations'] })
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Doações</h1>

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
          <HandCoins className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhuma doação encontrada.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((donation) => (
              <div
                key={donation.id}
                className="border-border bg-card rounded-xl border p-4 shadow-sm"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-4"
                  onClick={() =>
                    setExpandedId(
                      expandedId === donation.id ? null : donation.id,
                    )
                  }
                >
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">
                      {donation.donorName}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {donation.donorEmail}
                    </p>
                    <span className="text-foreground text-sm font-medium">
                      {Number(donation.amount).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      })}
                    </span>
                  </div>
                  {status === 'PENDING_REVIEW' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => approveMutation.mutate(donation.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="size-4" aria-hidden />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectTarget(donation.id)}
                      >
                        <X className="size-4" aria-hidden />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
                {expandedId === donation.id && (
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Método:</span>{' '}
                        <span className="text-foreground">
                          {donation.paymentMethod}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Data:</span>{' '}
                        <span className="text-foreground">
                          {new Date(donation.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {donation.proofUrl && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            Comprovante:
                          </span>{' '}
                          <a
                            href={donation.proofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver comprovante
                          </a>
                        </div>
                      )}
                      {donation.reviewNote && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Nota:</span>{' '}
                          <span className="text-foreground">
                            {donation.reviewNote}
                          </span>
                        </div>
                      )}
                    </div>
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
        title="Rejeitar doação"
      />
    </div>
  )
}
