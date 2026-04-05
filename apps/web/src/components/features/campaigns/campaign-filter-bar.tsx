'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdaptiveSelect } from '~/components/ui/adaptive-select'
import type {
  GeoCityItem,
  GeoStateItem,
} from '~/server/repositories/geo-place.repository'

interface CampaignFilterBarProps {
  states: GeoStateItem[]
  initialStateId?: string
  initialCityId?: string
  initialCityName?: string
  workspaceChip?: { id: string; name: string } | null
}

export function CampaignFilterBar({
  states,
  initialStateId,
  initialCityId,
  initialCityName,
  workspaceChip,
}: CampaignFilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [selectedStateId, setSelectedStateId] = useState(initialStateId ?? '')
  const [selectedCityId, setSelectedCityId] = useState(initialCityId ?? '')
  const [cities, setCities] = useState<GeoCityItem[]>([])
  const [loadingCities, setLoadingCities] = useState(false)

  // Fetch cities when state changes
  useEffect(() => {
    if (!selectedStateId) {
      setCities([])
      setSelectedCityId('')
      return
    }
    setLoadingCities(true)
    fetch(`/api/geo/cities?stateId=${selectedStateId}`)
      .then((r) => r.json())
      .then((data: GeoCityItem[]) => setCities(data))
      .catch(() => setCities([]))
      .finally(() => setLoadingCities(false))
  }, [selectedStateId])

  const handleStateChange = useCallback((id: string) => {
    setSelectedStateId(id)
    setSelectedCityId('')
  }, [])

  const isDirty = useMemo(() => {
    const urlCity = searchParams.get('cityId') ?? ''
    return selectedCityId !== urlCity
  }, [selectedCityId, searchParams])

  function handleSearch() {
    const params = new URLSearchParams()
    if (selectedCityId) params.set('cityId', selectedCityId)
    // preserve workspaceId if present
    const wsId = searchParams.get('workspaceId')
    if (wsId) params.set('workspaceId', wsId)
    router.push(`/campaigns?${params.toString()}`)
  }

  function dismissWorkspace() {
    const params = new URLSearchParams()
    const cityId = searchParams.get('cityId')
    if (cityId) params.set('cityId', cityId)
    router.push(`/campaigns?${params.toString()}`)
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Workspace chip */}
      {workspaceChip && (
        <div className="flex items-center gap-2">
          <span className="font-nunito bg-brand-primary-pale text-accent-navy flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold">
            {workspaceChip.name}
            <button
              type="button"
              onClick={dismissWorkspace}
              aria-label={`Remover filtro de organização ${workspaceChip.name}`}
              className="focus-visible:ring-brand-primary hover:text-brand-primary ml-0.5 rounded-full focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </span>
        </div>
      )}

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        {/* State picker */}
        <div className="w-[80px] shrink-0">
          <AdaptiveSelect
            options={states}
            getOptionValue={(s) => s.id}
            getOptionLabel={(s) => s.code ?? s.name}
            value={selectedStateId || undefined}
            onValueChange={handleStateChange}
            placeholder="UF"
            label="Estado"
            triggerClassName="h-11 w-full cursor-pointer rounded-[12px] text-[14px] font-semibold"
          />
        </div>

        {/* City picker */}
        <div className="min-w-0 flex-1">
          <AdaptiveSelect
            options={cities}
            getOptionValue={(c) => c.id}
            getOptionLabel={(c) => c.name}
            value={selectedCityId || undefined}
            onValueChange={setSelectedCityId}
            placeholder={
              loadingCities ? 'Carregando...' : (initialCityName ?? 'Cidade')
            }
            label="Cidade"
            disabled={!selectedStateId || loadingCities}
            triggerClassName="h-11 w-full cursor-pointer rounded-[12px] text-[14px] font-semibold disabled:opacity-50"
          />
        </div>

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          disabled={!isDirty}
          aria-label="Buscar campanhas"
          className="font-nunito bg-brand-primary focus-visible:ring-brand-primary flex h-11 shrink-0 cursor-pointer items-center justify-center rounded-[12px] px-3 text-[14px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 sm:px-5"
        >
          <Search className="size-4 sm:hidden" aria-hidden />
          <span className="hidden sm:inline">Buscar</span>
        </button>
      </div>
    </div>
  )
}
