import { Suspense } from 'react'
import { CampaignCard } from '~/components/features/campaigns/campaign-card'
import { CampaignFilterBar } from '~/components/features/campaigns/campaign-filter-bar'
import { EmptyState } from '~/components/ui/empty-state'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import {
  campaignRepository,
  geoPlaceRepository,
  workspaceRepository,
} from '~/server/repositories'
import {
  getPublicWorkspace,
  listPublicCampaigns,
  listStates,
} from '~/server/use-cases'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CampaignsPageProps {
  searchParams: Promise<{
    cityId?: string
    workspaceId?: string
    page?: string
  }>
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CampaignsPage({
  searchParams,
}: CampaignsPageProps) {
  const { cityId, workspaceId, page } = await searchParams
  const currentPage = page ? Math.max(1, Number(page)) : 1
  const perPage = 12

  const [campaignsResult, statesResult, cityInfo, workspaceResult] =
    await Promise.all([
      listPublicCampaigns(campaignRepository, {
        cityId,
        workspaceId,
        page: currentPage,
        perPage,
      }),
      listStates(geoPlaceRepository, {}),
      cityId
        ? geoPlaceRepository.findCityWithState(cityId)
        : Promise.resolve(null),
      workspaceId
        ? getPublicWorkspace(workspaceRepository, workspaceId)
        : Promise.resolve(null),
    ])

  const { items: campaigns, total } = campaignsResult.data
  const totalPages = Math.ceil(total / perPage)

  const workspaceChip = workspaceResult?.success
    ? {
        id: workspaceResult.workspace.id,
        name: workspaceResult.workspace.name,
      }
    : null

  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (cityId) params.set('cityId', cityId)
    if (workspaceId) params.set('workspaceId', workspaceId)
    if (p > 1) params.set('page', String(p))
    return `/campaigns?${params.toString()}`
  }

  return (
    <main className="bg-background min-h-dvh px-4 py-8 sm:px-6 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        {/* Heading */}
        <div className="mb-6">
          <h1 className="font-nunito text-accent-navy text-[24px] font-extrabold tracking-tight sm:text-[30px]">
            Campanhas ativas
          </h1>
          <p className="font-nunito text-accent-navy/60 mt-1 text-[14px] font-semibold sm:text-[16px]">
            Apoie causas animais e ajude pets que precisam de cuidados.
          </p>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <Suspense>
            <CampaignFilterBar
              states={statesResult.states}
              initialStateId={cityInfo?.state.id}
              initialCityId={cityInfo?.id}
              initialCityName={cityInfo?.name}
              workspaceChip={workspaceChip}
            />
          </Suspense>
        </div>

        {/* Total counter */}
        <p className="font-nunito text-accent-navy/50 mb-4 text-[13px] font-semibold sm:text-[14px]">
          {total}{' '}
          {total === 1 ? 'campanha encontrada' : 'campanhas encontradas'}
        </p>

        {/* Grid or empty state */}
        {campaigns.length === 0 ? (
          <EmptyState
            title="Nenhuma campanha encontrada"
            description="Tente ajustar os filtros ou selecione outra cidade."
          />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {campaigns.map((campaign) => (
                <CampaignCard
                  key={campaign.id}
                  id={campaign.id}
                  title={campaign.title}
                  description={campaign.description}
                  goalAmount={campaign.goalAmount}
                  currentAmount={campaign.currentAmount}
                  currency={campaign.currency}
                  coverImageUrl={campaign.coverImageUrl}
                  endsAt={campaign.endsAt}
                  workspace={campaign.workspace}
                  pet={campaign.pet}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-10">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href={pageUrl(currentPage - 1)}
                      aria-disabled={currentPage <= 1}
                      className={
                        currentPage <= 1 ? 'pointer-events-none opacity-50' : ''
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (p) => (
                      <PaginationItem key={p}>
                        <PaginationLink
                          href={pageUrl(p)}
                          isActive={p === currentPage}
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}

                  <PaginationItem>
                    <PaginationNext
                      href={pageUrl(currentPage + 1)}
                      aria-disabled={currentPage >= totalPages}
                      className={
                        currentPage >= totalPages
                          ? 'pointer-events-none opacity-50'
                          : ''
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </main>
  )
}
