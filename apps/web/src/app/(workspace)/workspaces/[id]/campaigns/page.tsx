'use client'

import { use, useState } from 'react'
import { Megaphone, Plus } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  WorkspaceCampaignCard,
  type WorkspaceCampaignItem,
} from '~/components/features/workspaces/workspace-campaign-card'
import {
  CampaignFormDialog,
  type CampaignFormData,
} from '~/components/features/workspaces/campaign-form-dialog'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PENDING_REVIEW', label: 'Em revisão' },
  { value: 'APPROVED', label: 'Aprovadas' },
  { value: 'REJECTED', label: 'Rejeitadas' },
]

interface CampaignsPageProps {
  params: Promise<{ id: string }>
}

interface CampaignsResponse {
  items: WorkspaceCampaignItem[]
  total: number
  page: number
  perPage: number
}

export default function WorkspaceCampaignsPage({ params }: CampaignsPageProps) {
  const { id: workspaceId } = use(params)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const perPage = 10
  const queryClient = useQueryClient()

  const queryKey = ['workspaceCampaigns', workspaceId, status, page]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
      })
      if (status) params.set('status', status)
      const res = await fetch(
        `/api/workspaces/${workspaceId}/campaigns?${params}`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Erro ao carregar campanhas')
      return res.json() as Promise<CampaignsResponse>
    },
  })

  const createMutation = useMutation({
    mutationFn: async (formData: CampaignFormData) => {
      const res = await fetch(`/api/workspaces/${workspaceId}/campaigns`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao criar campanha')
      }
    },
    onSuccess: () => {
      setCreateOpen(false)
      queryClient.invalidateQueries({ queryKey: ['workspaceCampaigns'] })
    },
    meta: { successMessage: 'Campanha criada com sucesso' },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-foreground text-2xl font-bold">Campanhas</h1>
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nova campanha</span>
        </Button>
      </div>

      {/* Status tabs */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => {
              setStatus(tab.value)
              setPage(1)
            }}
            className={cn(
              'focus-visible:ring-ring rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none',
              status === tab.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-32 animate-pulse rounded-xl" />
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
              <WorkspaceCampaignCard
                key={campaign.id}
                campaign={campaign}
                workspaceId={workspaceId}
              />
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

      {/* Create dialog */}
      <CampaignFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSubmit={(data) => createMutation.mutate(data)}
        isSubmitting={createMutation.isPending}
        mode="create"
      />
    </div>
  )
}
