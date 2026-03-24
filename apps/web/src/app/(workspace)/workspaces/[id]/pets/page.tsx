import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus } from 'lucide-react'
import { WorkspacePetCard } from '~/components/features/pets/workspace-pet-card'
import { EmptyState } from '~/components/ui/empty-state'
import { getServerPrincipal } from '~/lib/get-server-principal'
import { petRepository, workspaceRepository } from '~/server/repositories'
import { listWorkspacePets } from '~/server/use-cases'
import { cn } from '~/lib/utils'

// ─── Status filter tabs ────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'DRAFT', label: 'Rascunho' },
  { value: 'PENDING_REVIEW', label: 'Em revisão' },
  { value: 'APPROVED', label: 'Aprovados' },
  { value: 'REJECTED', label: 'Rejeitados' },
  { value: 'ADOPTED', label: 'Adotados' },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PetsPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ status?: string; page?: string }>
}

export default async function WorkspacePetsPage({
  params,
  searchParams,
}: PetsPageProps) {
  const { id: workspaceId } = await params
  const { status, page } = await searchParams

  const principal = await getServerPrincipal()
  if (!principal) redirect('/login')

  const result = await listWorkspacePets(
    petRepository,
    workspaceRepository,
    principal,
    {
      workspaceId,
      status: status || undefined,
      page: page ? Number(page) : 1,
      perPage: 20,
    },
  )

  if (!result.success) {
    if (result.code === 'UNAUTHENTICATED') redirect('/login')
    if (result.code === 'NOT_FOUND') redirect('/pets')
    if (result.code === 'FORBIDDEN') redirect('/')
  }

  const { items, total } = result.success ? result : { items: [], total: 0 }

  const activeStatus = status ?? ''

  return (
    <div className="flex flex-col gap-6 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-nunito text-accent-navy text-[28px] leading-tight font-extrabold lg:text-[32px]">
            Pets
          </h1>
          <p className="font-nunito text-muted-foreground mt-0.5 text-[14px] font-semibold">
            {total} {total === 1 ? 'animal cadastrado' : 'animais cadastrados'}
          </p>
        </div>

        <Link
          href={`/workspaces/${workspaceId}/pets/new`}
          className="font-nunito bg-accent-yellow text-accent-navy focus-visible:ring-accent-yellow flex items-center gap-2 rounded-[14px] px-4 py-2.5 text-[14px] font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
        >
          <Plus className="size-4" aria-hidden />
          Adicionar pet
        </Link>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => {
          const href = tab.value
            ? `/workspaces/${workspaceId}/pets?status=${tab.value}`
            : `/workspaces/${workspaceId}/pets`
          const isActive = activeStatus === tab.value

          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                'font-nunito focus-visible:ring-ring shrink-0 rounded-full px-4 py-1.5 text-[13px] font-bold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:outline-none',
                isActive
                  ? 'bg-accent-navy text-white'
                  : 'text-muted-foreground hover:bg-accent-navy/10 hover:text-accent-navy bg-white',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Grid */}
      {items.length === 0 ? (
        <EmptyState
          title="Nenhum pet encontrado"
          description={
            activeStatus
              ? 'Nenhum animal com esse status. Tente outro filtro.'
              : 'Adicione o primeiro pet da sua organização.'
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((pet) => (
            <WorkspacePetCard
              key={pet.id}
              id={pet.id}
              workspaceId={workspaceId}
              name={pet.name}
              species={pet.species}
              size={pet.size}
              status={pet.status}
              coverImage={pet.coverImage}
            />
          ))}
        </div>
      )}
    </div>
  )
}
