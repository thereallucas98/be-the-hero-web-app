import type { PrismaClient } from '~/generated/prisma/client'

export interface GeoPlaceRepository {
  findCityById(id: string): Promise<{ id: string; type: string } | null>
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
  }
}
