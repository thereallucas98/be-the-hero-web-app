'use client'

import { use, useState } from 'react'
import { Heart } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  WorkspaceInterestCard,
  type WorkspaceInterestItem,
} from '~/components/features/workspaces/workspace-interest-card'
import { ConvertInterestDialog } from '~/components/features/workspaces/convert-interest-dialog'
import { Button } from '~/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

interface InterestsPageProps {
  params: Promise<{ id: string }>
}

interface InterestsResponse {
  items: WorkspaceInterestItem[]
  total: number
  page: number
  perPage: number
}

export default function WorkspaceInterestsPage({ params }: InterestsPageProps) {
  const { id: workspaceId } = use(params)
  const [page, setPage] = useState(1)
  const perPage = 20
  const queryClient = useQueryClient()

  // ─── State for dialogs ───────────────────────────────────────────────────────
  const [dismissTarget, setDismissTarget] = useState<string | null>(null)
  const [convertTarget, setConvertTarget] =
    useState<WorkspaceInterestItem | null>(null)

  // ─── List query ──────────────────────────────────────────────────────────────
  const queryKey = ['workspaceInterests', workspaceId, page]
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/interests?page=${page}&perPage=${perPage}`,
        { credentials: 'include' },
      )
      if (!res.ok) throw new Error('Erro ao carregar interesses')
      return res.json() as Promise<InterestsResponse>
    },
  })

  // ─── Dismiss mutation ────────────────────────────────────────────────────────
  const dismissMutation = useMutation({
    mutationFn: async (interestId: string) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/interests/${interestId}`,
        { method: 'DELETE', credentials: 'include' },
      )
      if (!res.ok) throw new Error('Erro ao dispensar interesse')
    },
    onMutate: async (interestId) => {
      await queryClient.cancelQueries({ queryKey })
      const previous = queryClient.getQueryData<InterestsResponse>(queryKey)
      queryClient.setQueryData<InterestsResponse>(queryKey, (old) => {
        if (!old) return old
        return {
          ...old,
          items: old.items.filter((i) => i.id !== interestId),
          total: old.total - 1,
        }
      })
      return { previous }
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(queryKey, context.previous)
      }
    },
    onSettled: () => {
      setDismissTarget(null)
      queryClient.invalidateQueries({ queryKey: ['workspaceInterests'] })
    },
    meta: { successMessage: 'Interesse dispensado' },
  })

  // ─── Convert mutation ────────────────────────────────────────────────────────
  const convertMutation = useMutation({
    mutationFn: async ({
      interestId,
      notes,
    }: {
      interestId: string
      notes: string
    }) => {
      const res = await fetch(
        `/api/workspaces/${workspaceId}/interests/${interestId}/convert`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: notes || undefined }),
        },
      )
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao converter interesse')
      }
    },
    onSuccess: () => {
      setConvertTarget(null)
      toast.success('Adoção registrada com sucesso')
      queryClient.invalidateQueries({ queryKey: ['workspaceInterests'] })
    },
  })

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-4xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Interesses</h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhum interesse recebido ainda.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((interest) => (
              <WorkspaceInterestCard
                key={interest.id}
                interest={interest}
                onDismiss={(id) => setDismissTarget(id)}
                onConvert={(i) => setConvertTarget(i)}
                isDismissing={dismissMutation.isPending}
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

      {/* Dismiss confirmation */}
      <AlertDialog
        open={!!dismissTarget}
        onOpenChange={(open) => !open && setDismissTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dispensar interesse?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. O interesse será removido
              permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                dismissTarget && dismissMutation.mutate(dismissTarget)
              }
            >
              Dispensar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Convert dialog */}
      <ConvertInterestDialog
        interest={convertTarget}
        open={!!convertTarget}
        onOpenChange={(open) => !open && setConvertTarget(null)}
        onConfirm={(interestId, notes) =>
          convertMutation.mutate({ interestId, notes })
        }
        isConverting={convertMutation.isPending}
      />
    </div>
  )
}
