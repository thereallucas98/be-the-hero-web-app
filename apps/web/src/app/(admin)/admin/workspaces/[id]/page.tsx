'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Building2, Check, X } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { RejectDialog } from '~/components/features/admin/reject-dialog'
import { api } from '~/lib/api-client'

const TYPE_LABEL: Record<string, string> = {
  ONG: 'ONG',
  CLINIC: 'Clínica',
  PETSHOP: 'Petshop',
}

interface WorkspaceDetail {
  id: string
  name: string
  description: string | null
  type: string
  cnpj: string | null
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  verificationStatus: string
  reviewNote: string | null
  isActive: boolean
  createdAt: string
  location: {
    address: string | null
    city: { name: string } | null
    state: { name: string } | null
  } | null
  members: Array<{
    id: string
    role: string
    user: { id: string; fullName: string; email: string }
  }>
}

interface WorkspaceDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AdminWorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
  const { id } = use(params)
  const [rejectOpen, setRejectOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data: workspace, isLoading } = useQuery({
    queryKey: ['adminWorkspaceDetail', id],
    queryFn: () => api.get<WorkspaceDetail>(`/api/workspaces/${id}`),
  })

  const approveMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/api/admin/workspaces/${id}/approve`)
    },
    onSuccess: () => {
      toast.success('Workspace aprovado')
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaces'] })
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaceDetail', id] })
    },
  })

  const rejectMutation = useMutation({
    mutationFn: async (reviewNote: string) => {
      await api.post(`/api/admin/workspaces/${id}/reject`, { reviewNote })
    },
    onSuccess: () => {
      setRejectOpen(false)
      toast.success('Workspace rejeitado')
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaces'] })
      queryClient.invalidateQueries({ queryKey: ['adminWorkspaceDetail', id] })
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

  if (!workspace) {
    return (
      <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">
          Workspace não encontrado.
        </p>
      </div>
    )
  }

  const isPending = workspace.verificationStatus === 'PENDING'

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <Link
        href="/admin/workspaces"
        className="text-muted-foreground hover:text-foreground focus-visible:ring-ring mb-6 inline-flex items-center gap-1.5 text-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Voltar
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-start gap-4">
        <div className="bg-muted flex size-14 shrink-0 items-center justify-center rounded-xl">
          <Building2 className="text-muted-foreground size-6" aria-hidden />
        </div>
        <div>
          <h1 className="text-foreground text-xl font-bold">
            {workspace.name}
          </h1>
          <div className="mt-1 flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {TYPE_LABEL[workspace.type] ?? workspace.type}
            </Badge>
            <Badge variant="outline">{workspace.verificationStatus}</Badge>
          </div>
        </div>
      </div>

      {/* Actions */}
      {isPending && (
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
      {workspace.reviewNote && (
        <div className="bg-destructive/10 text-destructive mb-6 rounded-lg p-3 text-sm">
          <strong>Nota da revisão:</strong> {workspace.reviewNote}
        </div>
      )}

      {/* Info */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {workspace.cnpj && <InfoItem label="CNPJ" value={workspace.cnpj} />}
        {workspace.email && <InfoItem label="Email" value={workspace.email} />}
        {workspace.phone && (
          <InfoItem label="Telefone" value={workspace.phone} />
        )}
        {workspace.website && (
          <InfoItem label="Website" value={workspace.website} />
        )}
        {workspace.instagram && (
          <InfoItem label="Instagram" value={workspace.instagram} />
        )}
        <InfoItem
          label="Criado em"
          value={new Date(workspace.createdAt).toLocaleDateString('pt-BR')}
        />
      </div>

      {/* Description */}
      {workspace.description && (
        <section className="mb-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">
            Descrição
          </h2>
          <p className="text-foreground text-sm">{workspace.description}</p>
        </section>
      )}

      {/* Location */}
      {workspace.location && (
        <section className="mb-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">
            Localização
          </h2>
          <p className="text-foreground text-sm">
            {[
              workspace.location.address,
              workspace.location.city?.name,
              workspace.location.state?.name,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </section>
      )}

      {/* Members */}
      {workspace.members.length > 0 && (
        <section className="mb-6">
          <h2 className="text-foreground mb-2 text-sm font-semibold">
            Membros ({workspace.members.length})
          </h2>
          <div className="flex flex-col gap-2">
            {workspace.members.map((m) => (
              <div
                key={m.id}
                className="border-border flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">
                    {m.user.fullName}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {m.user.email}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {m.role}
                </Badge>
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
        title="Rejeitar workspace"
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
