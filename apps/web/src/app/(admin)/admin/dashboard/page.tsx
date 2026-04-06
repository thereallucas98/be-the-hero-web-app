'use client'

import { useQuery } from '@tanstack/react-query'
import { Building2, HandCoins, Megaphone, PawPrint } from 'lucide-react'
import { api } from '~/lib/api-client'

interface PlatformMetrics {
  totalPets: number
  petsByStatus: Record<string, number>
  totalAdoptions: number
  totalCampaigns: number
  campaignsByStatus: Record<string, number>
  totalDonationsRaised: string
  totalActiveWorkspaces: number
}

const PET_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovados',
  REJECTED: 'Rejeitados',
  ADOPTED: 'Adotados',
}

const CAMPAIGN_STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Rascunho',
  PENDING_REVIEW: 'Em revisão',
  APPROVED: 'Aprovadas',
  REJECTED: 'Rejeitadas',
  CLOSED: 'Encerradas',
}

export default function AdminDashboardPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['platformMetrics'],
    queryFn: () => api.get<PlatformMetrics>('/api/admin/metrics'),
  })

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Painel Administrativo
      </h1>

      {/* KPI cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={PawPrint}
          label="Total de pets"
          value={metrics.totalPets}
        />
        <KpiCard
          icon={PawPrint}
          label="Adoções"
          value={metrics.totalAdoptions}
        />
        <KpiCard
          icon={Building2}
          label="Workspaces ativos"
          value={metrics.totalActiveWorkspaces}
        />
        <KpiCard
          icon={Megaphone}
          label="Campanhas"
          value={metrics.totalCampaigns}
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

      {/* Breakdowns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownCard
          title="Pets por status"
          data={metrics.petsByStatus}
          labels={PET_STATUS_LABEL}
          icon={PawPrint}
        />
        <BreakdownCard
          title="Campanhas por status"
          data={metrics.campaignsByStatus}
          labels={CAMPAIGN_STATUS_LABEL}
          icon={Megaphone}
        />
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

function BreakdownCard({
  title,
  data,
  labels,
  icon: Icon,
}: {
  title: string
  data: Record<string, number>
  labels: Record<string, string>
  icon: React.ElementType
}) {
  const entries = Object.entries(data)

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="text-muted-foreground size-4" aria-hidden />
        <h2 className="text-foreground text-sm font-semibold">{title}</h2>
      </div>
      {entries.length === 0 ? (
        <p className="text-muted-foreground text-xs">Sem dados.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {entries.map(([status, count]) => (
            <div
              key={status}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">
                {labels[status] ?? status}
              </span>
              <span className="text-foreground font-medium">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
