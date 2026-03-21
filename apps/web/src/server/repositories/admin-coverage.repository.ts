import type { PrismaClient } from '~/generated/prisma/client'

export interface AdminCoverageItem {
  id: string
  adminUserId: string
  cityPlaceId: string
  createdAt: Date
}

export interface AdminCoverageRepository {
  listByAdmin(adminUserId: string): Promise<AdminCoverageItem[]>
  create(adminUserId: string, cityPlaceId: string): Promise<AdminCoverageItem>
  findById(id: string): Promise<AdminCoverageItem | null>
  exists(adminUserId: string, cityPlaceId: string): Promise<boolean>
  delete(id: string): Promise<void>
}

const coverageSelect = {
  id: true,
  adminUserId: true,
  cityPlaceId: true,
  createdAt: true,
} as const

export function createAdminCoverageRepository(
  prisma: PrismaClient,
): AdminCoverageRepository {
  return {
    async listByAdmin(adminUserId) {
      return prisma.adminCoverage.findMany({
        where: { adminUserId },
        select: coverageSelect,
        orderBy: { createdAt: 'asc' },
      })
    },

    async create(adminUserId, cityPlaceId) {
      return prisma.adminCoverage.create({
        data: { adminUserId, cityPlaceId },
        select: coverageSelect,
      })
    },

    async findById(id) {
      return prisma.adminCoverage.findUnique({
        where: { id },
        select: coverageSelect,
      })
    },

    async exists(adminUserId, cityPlaceId) {
      const count = await prisma.adminCoverage.count({
        where: { adminUserId, cityPlaceId },
      })
      return count > 0
    },

    async delete(id) {
      await prisma.adminCoverage.delete({ where: { id } })
    },
  }
}
