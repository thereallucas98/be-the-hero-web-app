import type { PrismaClient } from '~/generated/prisma/client'

export interface WorkspaceMetricsData {
  totalPets: number
  petsByStatus: Record<string, number>
  totalViews: number
  totalWhatsappClicks: number
  totalInterests: number
  totalAdoptions: number
  totalDonationsRaised: string
}

export interface PetMetricsData {
  views: number
  whatsappClicks: number
  interestCount: number
  petStatus: string
  adoptionId: string | null
  adoptedAt: Date | null
}

export interface PlatformMetricsInput {
  cityId?: string
  dateFrom?: string
  dateTo?: string
}

export interface PlatformMetricsData {
  totalPets: number
  petsByStatus: Record<string, number>
  totalAdoptions: number
  totalCampaigns: number
  campaignsByStatus: Record<string, number>
  totalDonationsRaised: string
  totalActiveWorkspaces: number
}

export interface MetricsRepository {
  getWorkspaceMetrics(workspaceId: string): Promise<WorkspaceMetricsData>
  getPetMetrics(petId: string): Promise<PetMetricsData | null>
  getPlatformMetrics(input: PlatformMetricsInput): Promise<PlatformMetricsData>
}

function toStatusMap(
  rows: Array<{ status: unknown; _count: { id: number } }>,
): Record<string, number> {
  const map: Record<string, number> = {}
  for (const row of rows) {
    map[String(row.status)] = row._count.id
  }
  return map
}

export function createMetricsRepository(
  prisma: PrismaClient,
): MetricsRepository {
  return {
    async getWorkspaceMetrics(workspaceId) {
      const [
        totalPets,
        petsByStatusRaw,
        totalViews,
        totalWhatsappClicks,
        totalInterests,
        totalAdoptions,
        donationsAgg,
      ] = await Promise.all([
        prisma.pet.count({ where: { workspaceId } }),
        prisma.pet.groupBy({
          by: ['status'],
          where: { workspaceId },
          _count: { id: true },
        }),
        prisma.petMetricEvent.count({
          where: { workspaceId, type: 'VIEW_PET' },
        }),
        prisma.petMetricEvent.count({
          where: { workspaceId, type: 'CLICK_WHATSAPP' },
        }),
        prisma.adoptionInterest.count({ where: { workspaceId } }),
        prisma.adoption.count({ where: { workspaceId } }),
        prisma.donation.aggregate({
          where: { workspaceId, status: 'APPROVED' },
          _sum: { amount: true },
        }),
      ])

      return {
        totalPets,
        petsByStatus: toStatusMap(petsByStatusRaw),
        totalViews,
        totalWhatsappClicks,
        totalInterests,
        totalAdoptions,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalDonationsRaised: String((donationsAgg as any)._sum?.amount ?? 0),
      }
    },

    async getPetMetrics(petId) {
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        select: {
          status: true,
          adoption: { select: { id: true, adoptedAt: true } },
        },
      })
      if (!pet) return null

      const [views, whatsappClicks, interestCount] = await Promise.all([
        prisma.petMetricEvent.count({ where: { petId, type: 'VIEW_PET' } }),
        prisma.petMetricEvent.count({
          where: { petId, type: 'CLICK_WHATSAPP' },
        }),
        prisma.adoptionInterest.count({ where: { petId } }),
      ])

      return {
        views,
        whatsappClicks,
        interestCount,
        petStatus: String(pet.status),
        adoptionId: pet.adoption?.id ?? null,
        adoptedAt: pet.adoption?.adoptedAt ?? null,
      }
    },

    async getPlatformMetrics(input) {
      const createdAtFilter =
        input.dateFrom || input.dateTo
          ? {
              gte: input.dateFrom ? new Date(input.dateFrom) : undefined,
              lte: input.dateTo ? new Date(input.dateTo) : undefined,
            }
          : undefined

      let workspaceIdFilter: { in: string[] } | undefined
      if (input.cityId) {
        const locations = await prisma.partnerWorkspaceLocation.findMany({
          where: { cityPlaceId: input.cityId },
          select: { workspaceId: true },
        })
        const ids = [...new Set(locations.map((l) => l.workspaceId))]
        workspaceIdFilter = { in: ids }
      }

      const petWhere = {
        ...(workspaceIdFilter ? { workspaceId: workspaceIdFilter } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      }
      const adoptionWhere = {
        ...(workspaceIdFilter ? { workspaceId: workspaceIdFilter } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      }
      const campaignWhere = {
        ...(workspaceIdFilter ? { workspaceId: workspaceIdFilter } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      }
      const donationWhere = {
        status: 'APPROVED' as const,
        ...(workspaceIdFilter ? { workspaceId: workspaceIdFilter } : {}),
        ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
      }
      const workspaceWhere = {
        isActive: true,
        verificationStatus: 'APPROVED' as const,
        ...(workspaceIdFilter ? { id: workspaceIdFilter } : {}),
      }

      const [
        totalPets,
        petsByStatusRaw,
        totalAdoptions,
        totalCampaigns,
        campaignsByStatusRaw,
        donationsAgg,
        totalActiveWorkspaces,
      ] = await Promise.all([
        prisma.pet.count({ where: petWhere }),
        prisma.pet.groupBy({
          by: ['status'],
          where: petWhere,
          _count: { id: true },
        }),
        prisma.adoption.count({ where: adoptionWhere }),
        prisma.campaign.count({ where: campaignWhere }),
        prisma.campaign.groupBy({
          by: ['status'],
          where: campaignWhere,
          _count: { id: true },
        }),
        prisma.donation.aggregate({
          where: donationWhere,
          _sum: { amount: true },
        }),
        prisma.partnerWorkspace.count({ where: workspaceWhere }),
      ])

      return {
        totalPets,
        petsByStatus: toStatusMap(petsByStatusRaw),
        totalAdoptions,
        totalCampaigns,
        campaignsByStatus: toStatusMap(campaignsByStatusRaw),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        totalDonationsRaised: String((donationsAgg as any)._sum?.amount ?? 0),
        totalActiveWorkspaces,
      }
    },
  }
}
