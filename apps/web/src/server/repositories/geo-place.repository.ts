import type { PrismaClient } from '~/generated/prisma/client'

export interface GeoStateItem {
  id: string
  name: string
  code: string | null
  slug: string
}

export interface GeoCityItem {
  id: string
  name: string
  slug: string
}

export interface GeoCityWithState {
  id: string
  name: string
  slug: string
  state: { id: string; name: string; code: string | null }
}

export interface GeoPlaceRepository {
  findCityById(id: string): Promise<{ id: string; type: string } | null>
  findCityWithState(id: string): Promise<GeoCityWithState | null>
  listStates(countryId?: string): Promise<GeoStateItem[]>
  listCities(stateId?: string): Promise<GeoCityItem[]>
}

export function createGeoPlaceRepository(
  prisma: PrismaClient,
): GeoPlaceRepository {
  return {
    async findCityById(id) {
      return prisma.geoPlace.findUnique({
        where: { id },
        select: { id: true, type: true },
      })
    },

    async findCityWithState(id) {
      const place = await prisma.geoPlace.findUnique({
        where: { id, type: 'CITY' },
        select: {
          id: true,
          name: true,
          slug: true,
          parent: { select: { id: true, name: true, code: true } },
        },
      })
      if (!place?.parent) return null
      return {
        id: place.id,
        name: place.name,
        slug: place.slug,
        state: place.parent,
      }
    },

    async listStates(countryId) {
      return prisma.geoPlace.findMany({
        where: {
          type: 'STATE',
          ...(countryId ? { parentId: countryId } : {}),
        },
        select: { id: true, name: true, code: true, slug: true },
        orderBy: { name: 'asc' },
      })
    },

    async listCities(stateId) {
      return prisma.geoPlace.findMany({
        where: {
          type: 'CITY',
          ...(stateId ? { parentId: stateId } : {}),
        },
        select: { id: true, name: true, slug: true },
        orderBy: { name: 'asc' },
      })
    },
  }
}
