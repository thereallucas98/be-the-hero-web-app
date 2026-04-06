'use client'

import { use } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
  Eye,
  HandCoins,
  HandHeart,
  Heart,
  Megaphone,
  MessageCircle,
  PawPrint,
  Plus,
} from 'lucide-react'

const PET_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovados',
  REJECTED: 'Rejeitados',
  ADOPTED: 'Adotados',
}

interface WorkspaceMetrics {
  totalPets: number
  petsByStatus: Record<string, number>
  totalViews: number
  totalWhatsappClicks: number
  totalInterests: number
  totalAdoptions: number
  totalDonationsRaised: string
}

interface DashboardPageProps {
  params: Promise<{ id: string }>
}

export default function WorkspaceDashboardPage({ params }: DashboardPageProps) {
  const { id: workspaceId } = use(params)

  const { data: metrics, isLoading } = useQuery({
    queryKey: ['workspaceMetrics', workspaceId],
    queryFn: async () => {
      const res = await fetch(`/api/workspaces/${workspaceId}/metrics`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao carregar métricas')
      return res.json() as Promise<WorkspaceMetrics>
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-muted h-28 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar as métricas.
        </p>
      </div>
    )
  }

  const donationsRaised = Number(metrics.totalDonationsRaised)

  return (
    <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Métricas</h1>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          href={`/workspaces/${workspaceId}/pets/new`}
          className="border-border bg-card hover:bg-muted/50 focus-visible:ring-ring flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Plus className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">Novo pet</p>
            <p className="text-muted-foreground text-xs">Cadastrar animal</p>
          </div>
        </Link>

        <Link
          href={`/workspaces/${workspaceId}/interests`}
          className="border-border bg-card hover:bg-muted/50 focus-visible:ring-ring flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Heart className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">Interesses</p>
            <p className="text-muted-foreground text-xs">Ver solicitações</p>
          </div>
        </Link>

        <Link
          href={`/workspaces/${workspaceId}/campaigns`}
          className="border-border bg-card hover:bg-muted/50 focus-visible:ring-ring flex items-center gap-3 rounded-xl border p-4 shadow-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
            <Megaphone className="size-5" aria-hidden />
          </div>
          <div>
            <p className="text-foreground text-sm font-semibold">Campanhas</p>
            <p className="text-muted-foreground text-xs">Gerenciar campanhas</p>
          </div>
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          icon={PawPrint}
          label="Total de pets"
          value={metrics.totalPets}
        />
        <KpiCard icon={Eye} label="Visualizações" value={metrics.totalViews} />
        <KpiCard
          icon={MessageCircle}
          label="Cliques no WhatsApp"
          value={metrics.totalWhatsappClicks}
        />
        <KpiCard
          icon={Heart}
          label="Interesses"
          value={metrics.totalInterests}
        />
        <KpiCard
          icon={HandHeart}
          label="Adoções"
          value={metrics.totalAdoptions}
        />
        <KpiCard
          icon={HandCoins}
          label="Doações arrecadadas"
          value={donationsRaised.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          })}
        />
      </div>

      {/* Pets by status */}
      <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2">
          <PawPrint className="text-muted-foreground size-4" aria-hidden />
          <h2 className="text-foreground text-sm font-semibold">
            Pets por status
          </h2>
        </div>
        {Object.keys(metrics.petsByStatus).length === 0 ? (
          <p className="text-muted-foreground text-xs">Sem dados.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {Object.entries(metrics.petsByStatus).map(([status, count]) => (
              <div
                key={status}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">
                  {PET_STATUS_LABEL[status] ?? status}
                </span>
                <span className="text-foreground font-medium">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function KpiCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: number | string
}) {
  return (
    <div className="border-border bg-card flex items-center gap-4 rounded-xl border p-4 shadow-sm">
      <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg">
        <Icon className="size-5" aria-hidden />
      </div>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="text-foreground text-lg font-bold">{value}</p>
      </div>
    </div>
  )
}
