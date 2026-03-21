import type {
  GeoPlaceRepository,
  GeoStateItem,
} from '../../repositories/geo-place.repository'

export interface ListStatesInput {
  countryId?: string
}

export type ListStatesResult = { success: true; states: GeoStateItem[] }

export async function listStates(
  geoPlaceRepo: GeoPlaceRepository,
  input: ListStatesInput,
): Promise<ListStatesResult> {
  const states = await geoPlaceRepo.listStates(input.countryId)
  return { success: true, states }
}
