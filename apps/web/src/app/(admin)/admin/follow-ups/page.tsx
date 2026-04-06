'use client'

import { useState } from 'react'
import { Check, ClipboardCheck, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'
import { api } from '~/lib/api-client'
import { cn } from '~/lib/utils'

const STATUS_TABS = [
  { value: 'SUBMITTED', label: 'Enviados' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
]

interface SubmissionItem {
  id: string
  status: string
  submittedAt: string
  photoUrl: string | null
  message: string | null
  followUp: {
    id: string
    type: string
    scheduledAt: string
    adoption: {
      id: string
      pet: { id: string; name: string }
      guardian: { id: string; fullName: string }
      workspace: { id: string; name: string }
    }
  }
}

interface SubmissionsResponse {
  items: SubmissionItem[]
  total: number
  page: number
  perPage: number
}

export default function AdminFollowUpsPage() {
  const [status, setStatus] = useState('SUBMITTED')
  const [page, setPage] = useState(1)
  const [rejectTarget, setRejectTarget] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const perPage = 20
  const queryClient = useQueryClient()
  const queryKey = ['adminFollowUps', status, page]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () =>
      api.get<SubmissionsResponse>(
        `/api/admin/follow-up-submissions?status=${status}&page=${page}&perPage=${perPage}`,
      ),
  })

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/api/admin/follow-up-submissions/${id}/approve`)
    },
    onSuccess: () => {
      toast.success('Submissão aprovada')
      queryClient.invalidateQueries({ queryKey: ['adminFollowUps'] })
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
      await api.post(`/api/admin/follow-up-submissions/${id}/reject`, {
        reviewNote,
      })
    },
    onSuccess: () => {
      setRejectTarget(null)
      toast.success('Submissão rejeitada')
      queryClient.invalidateQueries({ queryKey: ['adminFollowUps'] })
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Acompanhamentos
      </h1>

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
          <ClipboardCheck
            className="text-muted-foreground size-10"
            aria-hidden
          />
          <p className="text-muted-foreground text-sm">
            Nenhuma submissão encontrada.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((sub) => (
              <div
                key={sub.id}
                className="border-border bg-card rounded-xl border p-4 shadow-sm"
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-4"
                  onClick={() =>
                    setExpandedId(expandedId === sub.id ? null : sub.id)
                  }
                >
                  <div>
                    <h3 className="text-foreground text-sm font-semibold">
                      {sub.followUp?.adoption?.pet?.name ?? 'Pet'} —{' '}
                      {sub.followUp?.adoption?.guardian?.fullName ?? 'Tutor'}
                    </h3>
                    <p className="text-muted-foreground text-xs">
                      {sub.followUp?.type} •{' '}
                      {sub.followUp?.adoption?.workspace?.name}
                    </p>
                    <span className="text-muted-foreground text-xs">
                      Enviado em{' '}
                      {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  {status === 'SUBMITTED' && (
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-600 text-green-600 hover:bg-green-50"
                        onClick={() => approveMutation.mutate(sub.id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="size-4" aria-hidden />
                        Aprovar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setRejectTarget(sub.id)}
                      >
                        <X className="size-4" aria-hidden />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
                {expandedId === sub.id && (
                  <div className="border-border mt-3 border-t pt-3">
                    <div className="flex flex-col gap-2 text-xs">
                      {sub.followUp?.scheduledAt && (
                        <div>
                          <span className="text-muted-foreground">
                            Previsto para:
                          </span>{' '}
                          <span className="text-foreground">
                            {new Date(
                              sub.followUp.scheduledAt,
                            ).toLocaleDateString('pt-BR')}
                          </span>
                        </div>
                      )}
                      {sub.message && (
                        <div>
                          <span className="text-muted-foreground">
                            Mensagem:
                          </span>{' '}
                          <span className="text-foreground">{sub.message}</span>
                        </div>
                      )}
                      {sub.photoUrl && (
                        <div>
                          <span className="text-muted-foreground">Foto:</span>{' '}
                          <a
                            href={sub.photoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Ver foto
                          </a>
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
        title="Rejeitar submissão"
      />
    </div>
  )
}
