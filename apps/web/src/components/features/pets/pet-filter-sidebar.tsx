'use client'

import { Search, SlidersHorizontal, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Sheet,
  SheetClose,
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
      <Select
        value={value === '' ? FILTER_ALL : value}
        onValueChange={(v) => onChange(v === FILTER_ALL ? '' : v)}
      >
        <SelectTrigger className="font-nunito bg-brand-primary-dark h-auto w-full cursor-pointer rounded-[15px] border-none py-[18px] pl-5 text-[16px] font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none [&>svg]:text-white [&>svg]:opacity-100">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-brand-primary-dark border-none text-white">
          {options.map((opt) => (
            <SelectItem
              key={opt.value || FILTER_ALL}
              value={opt.value === '' ? FILTER_ALL : opt.value}
              className="focus:bg-brand-primary text-white focus:text-white"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
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
  onSearch,
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
  onSearch: () => void
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
      <Select
        value={selectedStateId || undefined}
        onValueChange={onStateChange}
      >
        <SelectTrigger
          aria-label="Selecionar estado"
          className={cn(
            'shrink-0 cursor-pointer rounded-[15px] border border-white/40 bg-transparent font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none [&>svg]:text-white [&>svg]:opacity-100',
            compact
              ? 'h-12 w-[72px] pl-3 text-[14px]'
              : 'h-[60px] w-[90px] pl-4 text-[16px]',
          )}
        >
          <SelectValue placeholder="UF" />
        </SelectTrigger>
        <SelectContent>
          {states.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.code ?? s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* City picker */}
      <Select
        value={selectedCityId || undefined}
        onValueChange={onCityChange}
        disabled={!selectedStateId || loadingCities}
      >
        <SelectTrigger
          aria-label="Selecionar cidade"
          className={cn(
            'flex-1 cursor-pointer rounded-[15px] border border-white/40 bg-transparent font-extrabold text-white shadow-none focus:ring-2 focus:ring-white focus:outline-none disabled:opacity-50 [&>svg]:text-white [&>svg]:opacity-100',
            compact ? 'h-12 pl-3 text-[14px]' : 'h-[60px] pl-4 text-[16px]',
          )}
        >
          <SelectValue
            placeholder={
              loadingCities ? 'Carregando...' : (initialCityName ?? 'Cidade')
            }
          />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Search button */}
      <button
        onClick={onSearch}
        aria-label="Buscar animais"
        className={cn(
          'bg-accent-yellow flex shrink-0 cursor-pointer items-center justify-center rounded-[18px] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
          compact ? 'size-12' : 'size-[60px] rounded-[20px]',
        )}
      >
        <Search
          className={cn('text-white', compact ? 'size-4' : 'size-5')}
          aria-hidden
        />
      </button>
    </div>
  )
}

// ─── Filter panel content (shared between desktop + mobile Sheet) ─────────────

function FilterPanelContent({
  ageCategory,
  energyLevel,
  size,
  independenceLevel,
  onAgeChange,
  onEnergyChange,
  onSizeChange,
  onIndependenceChange,
}: {
  ageCategory: string
  energyLevel: string
  size: string
  independenceLevel: string
  onAgeChange: (v: string) => void
  onEnergyChange: (v: string) => void
  onSizeChange: (v: string) => void
  onIndependenceChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <p className="font-nunito text-[20px] font-extrabold text-white">
        Filtros
      </p>
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
    if (ageCategory) params.set('ageCategory', ageCategory)
    if (energyLevel) params.set('energyLevel', energyLevel)
    if (size) params.set('size', size)
    if (independenceLevel) params.set('independenceLevel', independenceLevel)
    router.push(`/pets?${params.toString()}`)
  }, [
    router,
    selectedCityId,
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
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
    onSearch: handleSearch,
  }

  const filterPanelProps = {
    ageCategory,
    energyLevel,
    size,
    independenceLevel,
    onAgeChange: setAgeCategory,
    onEnergyChange: setEnergyLevel,
    onSizeChange: setSize,
    onIndependenceChange: setIndependenceLevel,
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
          side="right"
          className="bg-brand-primary w-[320px] border-none p-0 sm:w-[360px]"
        >
          <SheetHeader className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-nunito text-[20px] font-extrabold text-white">
                Filtros
              </SheetTitle>
              <SheetClose className="rounded-md text-white/70 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none">
                <X className="size-5" aria-hidden />
                <span className="sr-only">Fechar</span>
              </SheetClose>
            </div>
          </SheetHeader>
          <div className="flex flex-col gap-5 overflow-y-auto px-6 pb-8">
            <FilterSelect
              label="Idade"
              options={AGE_OPTIONS}
              value={ageCategory}
              onChange={setAgeCategory}
            />
            <FilterSelect
              label="Nível de Energia"
              options={ENERGY_OPTIONS}
              value={energyLevel}
              onChange={setEnergyLevel}
            />
            <FilterSelect
              label="Porte do animal"
              options={SIZE_OPTIONS}
              value={size}
              onChange={setSize}
            />
            <FilterSelect
              label="Nível de independência"
              options={INDEPENDENCE_OPTIONS}
              value={independenceLevel}
              onChange={setIndependenceLevel}
            />
            <button
              onClick={handleSearch}
              className="font-nunito bg-accent-yellow mt-2 w-full cursor-pointer rounded-[15px] py-4 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Aplicar filtros
            </button>
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
