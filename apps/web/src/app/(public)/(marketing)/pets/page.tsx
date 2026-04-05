import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { PetCard } from '~/components/features/pets/pet-card'
import { PetFilterSidebar } from '~/components/features/pets/pet-filter-sidebar'
import { EmptyState } from '~/components/ui/empty-state'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { geoPlaceRepository, petRepository } from '~/server/repositories'
import { listCities, listPets, listStates } from '~/server/use-cases'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetsPageProps {
  searchParams: Promise<{
    cityPlaceId?: string
    ageCategory?: string
    energyLevel?: string
    size?: string
    independenceLevel?: string
    species?: string
    page?: string
  }>
}

// ─── City auto-resolution ─────────────────────────────────────────────────────

async function resolveDefaultCity() {
  try {
    const { states } = await listStates(geoPlaceRepository, {})
    const pb = states.find((s) => s.code === 'PB')
    if (!pb) return null

    const { cities } = await listCities(geoPlaceRepository, { stateId: pb.id })
    const matches = cities.filter((c) =>
      c.name.toLowerCase().includes('joão pessoa'),
    )

    return matches.length === 1 ? matches[0] : null
  } catch {
    return null
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function PetsPage({ searchParams }: PetsPageProps) {
  const params = await searchParams
  const {
    cityPlaceId,
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
    species,
    page,
  } = params

  // Auto-resolve JPA when no city is selected
  if (!cityPlaceId) {
    const defaultCity = await resolveDefaultCity()
    if (defaultCity) {
      redirect(`/pets?cityPlaceId=${defaultCity.id}`)
    }
    // Resolution failed → fall through and render with empty filters
  }

  // Fetch page data in parallel
  const [statesResult, petsResult, cityInfo] = await Promise.all([
    listStates(geoPlaceRepository, {}),
    listPets(petRepository, {
      cityPlaceId,
      ageCategory,
      energyLevel,
      size,
      independenceLevel,
      species,
      page: page ? Number(page) : 1,
    }),
    cityPlaceId
      ? geoPlaceRepository.findCityWithState(cityPlaceId)
      : Promise.resolve(null),
  ])

  const { items: pets, total, perPage } = petsResult
  const currentPage = page ? Number(page) : 1
  const totalPages = Math.ceil(total / perPage)

  // Build a URL preserving all active filters with a new page number
  function pageUrl(p: number) {
    const params = new URLSearchParams()
    if (cityPlaceId) params.set('cityPlaceId', cityPlaceId)
    if (species) params.set('species', species)
    if (ageCategory) params.set('ageCategory', ageCategory)
    if (energyLevel) params.set('energyLevel', energyLevel)
    if (size) params.set('size', size)
    if (independenceLevel) params.set('independenceLevel', independenceLevel)
    if (p > 1) params.set('page', String(p))
    return `/pets?${params.toString()}`
  }

  return (
    // flex-col on mobile (sidebar stacks above content), flex-row on desktop
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Suspense>
        <PetFilterSidebar
          states={statesResult.states}
          initialCityId={cityInfo?.id}
          initialCityName={cityInfo?.name}
          initialStateId={cityInfo?.state.id}
        />
      </Suspense>

      {/* Content area */}
      <main className="bg-background flex-1 px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
        {/* Header */}
        <p className="font-nunito text-accent-navy mb-6 text-[16px] sm:text-[18px] md:text-[20px]">
          Encontre <span className="font-extrabold">{total} amigos</span> na sua
          cidade
        </p>

        {/* Pet grid — auto-fill responsive columns */}
        {pets.length === 0 ? (
          <EmptyState
            title="Nenhum animal encontrado"
            description="Tente ajustar os filtros ou selecione outra cidade para ver os amigos disponíveis."
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
              {pets.map((pet, i) => (
                <PetCard
                  key={pet.id}
                  id={pet.id}
                  name={pet.name}
                  coverImage={pet.coverImage}
                  highlighted={i === 0}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination className="mt-8">
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
      </main>
    </div>
  )
}
