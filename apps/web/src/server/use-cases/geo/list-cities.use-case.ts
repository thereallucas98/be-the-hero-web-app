import type {
  GeoCityItem,
  GeoPlaceRepository,
} from '../../repositories/geo-place.repository'

export interface ListCitiesInput {
  stateId?: string
}

export type ListCitiesResult = { success: true; cities: GeoCityItem[] }

export async function listCities(
  geoPlaceRepo: GeoPlaceRepository,
  input: ListCitiesInput,
): Promise<ListCitiesResult> {
  const cities = await geoPlaceRepo.listCities(input.stateId)
  return { success: true, cities }
}
