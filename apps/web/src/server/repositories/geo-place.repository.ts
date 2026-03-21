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

export interface GeoPlaceRepository {
  findCityById(id: string): Promise<{ id: string; type: string } | null>
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
