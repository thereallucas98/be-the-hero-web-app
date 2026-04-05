'use client'

import { SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdaptiveSelect } from '~/components/ui/adaptive-select'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '~/components/ui/sheet'
import { LogoIcon } from '~/components/ui/logo'
import { cn } from '~/lib/utils'
import type {
  GeoCityItem,
  GeoStateItem,
} from '~/server/repositories/geo-place.repository'

// ─── Filter option maps ────────────────────────────────────────────────────────

const AGE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'PUPPY', label: 'Filhote' },
  { value: 'YOUNG', label: 'Jovem' },
  { value: 'ADULT', label: 'Adulto' },
  { value: 'SENIOR', label: 'Sênior' },
]

const ENERGY_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'LOW', label: 'Baixo' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'HIGH', label: 'Alto' },
]

const SIZE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'SMALL', label: 'Pequenino' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'LARGE', label: 'Grande' },
]

const INDEPENDENCE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'LOW', label: 'Baixo' },
  { value: 'MEDIUM', label: 'Médio' },
  { value: 'HIGH', label: 'Alto' },
]

const SPECIES_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'DOG', label: 'Cachorro' },
  { value: 'CAT', label: 'Gato' },
  { value: 'RABBIT', label: 'Coelho' },
  { value: 'BIRD', label: 'Pássaro' },
  { value: 'HORSE', label: 'Cavalo' },
  { value: 'COW', label: 'Vaca' },
  { value: 'GOAT', label: 'Cabra' },
  { value: 'PIG', label: 'Porco' },
  { value: 'TURTLE', label: 'Tartaruga' },
  { value: 'OTHER', label: 'Outro' },
]

// ─── Reusable filter select ───────────────────────────────────────────────────

const FILTER_ALL = '__all__'

function FilterSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="font-nunito text-[12px] font-medium text-white/80">
        {label}
      </span>
      <AdaptiveSelect
        options={options}
        getOptionValue={(o) => (o.value === '' ? FILTER_ALL : o.value)}
        getOptionLabel={(o) => o.label}
        value={value === '' ? FILTER_ALL : value}
        onValueChange={(v) => onChange(v === FILTER_ALL ? '' : v)}
        label={label}
        triggerClassName="font-nunito bg-brand-primary-dark h-auto w-full cursor-pointer rounded-[15px] border-none py-[18px] pl-5 text-[16px] font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none [&>svg]:text-white [&>svg]:opacity-100"
      />
    </div>
  )
}

// ─── Location row (shared between desktop + mobile) ───────────────────────────

function LocationRow({
  states,
  cities,
  loadingCities,
  selectedStateId,
  selectedCityId,
  initialCityName,
  onStateChange,
  onCityChange,
  compact,
}: {
  states: GeoStateItem[]
  cities: GeoCityItem[]
  loadingCities: boolean
  selectedStateId: string
  selectedCityId: string
  initialCityName?: string
  onStateChange: (id: string) => void
  onCityChange: (id: string) => void
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-2',
        compact ? 'w-full' : 'px-8 pb-6',
      )}
    >
      {/* State picker */}
      <div className={cn('shrink-0', compact ? 'w-[72px]' : 'w-[90px]')}>
        <AdaptiveSelect
          options={states}
          getOptionValue={(s) => s.id}
          getOptionLabel={(s) => s.code ?? s.name}
          value={selectedStateId || undefined}
          onValueChange={onStateChange}
          placeholder="UF"
          label="Estado"
          triggerClassName={cn(
            'cursor-pointer rounded-[15px] border border-white/40 bg-transparent font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none [&>svg]:text-white [&>svg]:opacity-100',
            compact ? 'h-12 pl-3 text-[14px]' : 'h-[60px] pl-4 text-[16px]',
          )}
        />
      </div>

      {/* City picker */}
      <div className="flex-1">
        <AdaptiveSelect
          options={cities}
          getOptionValue={(c) => c.id}
          getOptionLabel={(c) => c.name}
          value={selectedCityId || undefined}
          onValueChange={onCityChange}
          placeholder={
            loadingCities ? 'Carregando...' : (initialCityName ?? 'Cidade')
          }
          label="Cidade"
          disabled={!selectedStateId || loadingCities}
          triggerClassName={cn(
            'w-full cursor-pointer rounded-[15px] border border-white/40 bg-transparent font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50 [&>svg]:text-white [&>svg]:opacity-100',
            compact ? 'h-12 pl-3 text-[14px]' : 'h-[60px] pl-4 text-[16px]',
          )}
        />
      </div>
    </div>
  )
}

// ─── Filter panel content (shared between desktop + mobile Sheet) ─────────────

function FilterPanelContent({
  ageCategory,
  energyLevel,
  size,
  independenceLevel,
  species,
  isDirty,
  onAgeChange,
  onEnergyChange,
  onSizeChange,
  onIndependenceChange,
  onSpeciesChange,
  onApply,
}: {
  ageCategory: string
  energyLevel: string
  size: string
  independenceLevel: string
  species: string
  isDirty: boolean
  onAgeChange: (v: string) => void
  onEnergyChange: (v: string) => void
  onSizeChange: (v: string) => void
  onIndependenceChange: (v: string) => void
  onSpeciesChange: (v: string) => void
  onApply: () => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <FilterSelect
        label="Tipo"
        options={SPECIES_OPTIONS}
        value={species}
        onChange={onSpeciesChange}
      />
      <FilterSelect
        label="Idade"
        options={AGE_OPTIONS}
        value={ageCategory}
        onChange={onAgeChange}
      />
      <FilterSelect
        label="Nível de Energia"
        options={ENERGY_OPTIONS}
        value={energyLevel}
        onChange={onEnergyChange}
      />
      <FilterSelect
        label="Porte do animal"
        options={SIZE_OPTIONS}
        value={size}
        onChange={onSizeChange}
      />
      <FilterSelect
        label="Nível de independência"
        options={INDEPENDENCE_OPTIONS}
        value={independenceLevel}
        onChange={onIndependenceChange}
      />
      <button
        onClick={onApply}
        disabled={!isDirty}
        className="font-nunito bg-accent-yellow mt-2 w-full cursor-pointer rounded-[15px] py-4 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
      >
        Buscar
      </button>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface PetFilterSidebarProps {
  states: GeoStateItem[]
  initialCityId?: string
  initialCityName?: string
  initialStateId?: string
}

export function PetFilterSidebar({
  states,
  initialCityId,
  initialCityName,
  initialStateId,
}: PetFilterSidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Location state
  const [selectedStateId, setSelectedStateId] = useState(initialStateId ?? '')
  const [selectedCityId, setSelectedCityId] = useState(initialCityId ?? '')
  const [cities, setCities] = useState<GeoCityItem[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Filter state
  const [ageCategory, setAgeCategory] = useState(
    searchParams.get('ageCategory') ?? '',
  )
  const [energyLevel, setEnergyLevel] = useState(
    searchParams.get('energyLevel') ?? '',
  )
  const [size, setSize] = useState(searchParams.get('size') ?? '')
  const [independenceLevel, setIndependenceLevel] = useState(
    searchParams.get('independenceLevel') ?? '',
  )
  const [species, setSpecies] = useState(searchParams.get('species') ?? '')

  // Seed cities list on mount when an initial state is present
  useEffect(() => {
    if (!selectedStateId) return
    setLoadingCities(true)
    fetch(`/api/geo/cities?stateId=${selectedStateId}`)
      .then((r) => r.json())
      .then((data: GeoCityItem[]) => setCities(data))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false))
  }, [selectedStateId])

  const handleStateChange = useCallback((stateId: string) => {
    setSelectedStateId(stateId)
    setSelectedCityId('')
  }, [])

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()
    if (selectedCityId) params.set('cityPlaceId', selectedCityId)
    if (species) params.set('species', species)
    if (ageCategory) params.set('ageCategory', ageCategory)
    if (energyLevel) params.set('energyLevel', energyLevel)
    if (size) params.set('size', size)
    if (independenceLevel) params.set('independenceLevel', independenceLevel)
    router.push(`/pets?${params.toString()}`)
  }, [
    router,
    selectedCityId,
    species,
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
  ])

  const isDirty = useMemo(() => {
    return (
      selectedCityId !== (searchParams.get('cityPlaceId') ?? '') ||
      species !== (searchParams.get('species') ?? '') ||
      ageCategory !== (searchParams.get('ageCategory') ?? '') ||
      energyLevel !== (searchParams.get('energyLevel') ?? '') ||
      size !== (searchParams.get('size') ?? '') ||
      independenceLevel !== (searchParams.get('independenceLevel') ?? '')
    )
  }, [
    selectedCityId,
    species,
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
    searchParams,
  ])

  const locationRowProps = {
    states,
    cities,
    loadingCities,
    selectedStateId,
    selectedCityId,
    initialCityName,
    onStateChange: handleStateChange,
    onCityChange: setSelectedCityId,
  }

  const filterPanelProps = {
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
    species,
    isDirty,
    onAgeChange: setAgeCategory,
    onEnergyChange: setEnergyLevel,
    onSizeChange: setSize,
    onIndependenceChange: setIndependenceLevel,
    onSpeciesChange: setSpecies,
    onApply: handleSearch,
  }

  // ── Mobile top bar (hidden on lg+) ──────────────────────────────────────────
  const mobileBar = (
    <div className="bg-brand-primary flex w-full items-center gap-2 px-4 py-3 lg:hidden">
      <LocationRow {...locationRowProps} compact />

      {/* Filter sheet trigger */}
      <Sheet>
        <SheetTrigger asChild>
          <button
            aria-label="Abrir filtros"
            className="flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-[18px] border border-white/40 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            <SlidersHorizontal className="size-4 text-white" aria-hidden />
          </button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="bg-brand-primary max-h-[85dvh] rounded-t-[20px] border-none p-0 [&>button]:text-white"
        >
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle className="font-nunito text-[20px] font-extrabold text-white">
              Filtros
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-8">
            <FilterPanelContent {...filterPanelProps} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )

  // ── Desktop sidebar (hidden below lg) ──────────────────────────────────────
  const desktopSidebar = (
    <aside
      data-slot="pet-filter-sidebar"
      className="bg-brand-primary sticky top-0 hidden h-dvh w-[280px] shrink-0 flex-col overflow-y-auto lg:flex xl:w-[392px]"
    >
      {/* Logo */}
      <div className="px-10 pt-14 pb-10 xl:px-14">
        <Link href="/" aria-label="Voltar à página inicial">
          <LogoIcon className="size-11 text-white" />
        </Link>
      </div>

      {/* Location pickers */}
      <LocationRow {...locationRowProps} />

      {/* Filters */}
      <div className="px-8 pb-10 xl:px-10">
        <p className="font-nunito mb-5 text-[20px] font-extrabold text-white">
          Filtros
        </p>
        <FilterPanelContent {...filterPanelProps} />
      </div>
    </aside>
  )

  return (
    <>
      {mobileBar}
      {desktopSidebar}
    </>
  )
}
