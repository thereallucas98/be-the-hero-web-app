import type { PrismaClient } from '~/generated/prisma/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CreateCampaignData {
  workspaceId: string
  petId?: string
  title: string
  description: string
  goalAmount: number
  currency?: string
  createdByUserId: string
}

export interface UpdateCampaignData {
  title?: string
  description?: string
  goalAmount?: number
  currency?: string
  petId?: string | null
  coverImageUrl?: string | null
  startsAt?: string | null
  endsAt?: string | null
}

export interface CampaignItem {
  id: string
  workspaceId: string
  petId: string | null
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  status: string
  approvedAt: Date | null
  approvedByUserId: string | null
  reviewNote: string | null
  startsAt: Date | null
  endsAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CampaignDocumentSummary {
  id: string
  type: string
  title: string
  status: string
}

export interface CampaignDetailItem extends CampaignItem {
  documents: CampaignDocumentSummary[]
  workspace: { id: string; name: string }
  pet: { id: string; name: string } | null
}

export interface ListCampaignsInput {
  status?: string
  workspaceId?: string
  page: number
  perPage: number
}

export interface ListCampaignsResult {
  items: CampaignItem[]
  total: number
  page: number
  perPage: number
}

export interface PublicCampaignItem {
  id: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  endsAt: Date | null
  approvedAt: Date | null
  workspace: { id: string; name: string; type: string }
  pet: { id: string; name: string; species: string } | null
}

export interface ListPublicCampaignsInput {
  cityId?: string
  workspaceId?: string
  petId?: string
  page: number
  perPage: number
}

export interface ListPublicCampaignsResult {
  items: PublicCampaignItem[]
  total: number
  page: number
  perPage: number
}

export interface CampaignRepository {
  create(data: CreateCampaignData): Promise<CampaignItem>
  findById(id: string): Promise<CampaignDetailItem | null>
  listByWorkspace(
    workspaceId: string,
    input: { status?: string; page: number; perPage: number },
  ): Promise<ListCampaignsResult>
  listForAdmin(input: ListCampaignsInput): Promise<ListCampaignsResult>
  update(id: string, data: UpdateCampaignData): Promise<CampaignItem>
  submitForReview(id: string): Promise<CampaignItem>
  approve(id: string, approvedByUserId: string): Promise<CampaignItem>
  reject(id: string, reviewNote: string): Promise<CampaignItem>
  countDocuments(id: string): Promise<number>
  listPublic(
    input: ListPublicCampaignsInput,
  ): Promise<ListPublicCampaignsResult>
}

// ─── Factory ─────────────────────────────────────────────────────────────────

const campaignSelect = {
  id: true,
  workspaceId: true,
  petId: true,
  title: true,
  description: true,
  goalAmount: true,
  currentAmount: true,
  currency: true,
  coverImageUrl: true,
  status: true,
  approvedAt: true,
  approvedByUserId: true,
  reviewNote: true,
  startsAt: true,
  endsAt: true,
  createdAt: true,
  updatedAt: true,
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeCampaign(c: any): CampaignItem {
  return {
    ...c,
    goalAmount: String(c.goalAmount),
    currentAmount: String(c.currentAmount),
  }
}

export function createCampaignRepository(
  prisma: PrismaClient,
): CampaignRepository {
  return {
    async create(data) {
      const campaign = await prisma.campaign.create({
        data: {
          workspaceId: data.workspaceId,
          petId: data.petId ?? null,
          title: data.title,
          description: data.description,
          goalAmount: data.goalAmount,
          currency: data.currency ?? 'BRL',
        },
        select: campaignSelect,
      })
      return serializeCampaign(campaign)
    },

    async findById(id) {
      const campaign = await prisma.campaign.findUnique({
        where: { id },
        select: {
          ...campaignSelect,
          documents: {
            select: { id: true, type: true, title: true, status: true },
            orderBy: { createdAt: 'asc' },
          },
          workspace: { select: { id: true, name: true } },
          pet: { select: { id: true, name: true } },
        },
      })
      if (!campaign) return null
      return {
        ...serializeCampaign(campaign),
        documents: campaign.documents,
        workspace: campaign.workspace,
        pet: campaign.pet,
      }
    },

    async listByWorkspace(workspaceId, { status, page, perPage }) {
      const where = {
        workspaceId,
        ...(status ? { status: status as never } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          select: campaignSelect,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.campaign.count({ where }),
      ])
      return { items: items.map(serializeCampaign), total, page, perPage }
    },

    async listForAdmin({ status, workspaceId, page, perPage }) {
      const where = {
        ...(status ? { status: status as never } : {}),
        ...(workspaceId ? { workspaceId } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          select: campaignSelect,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.campaign.count({ where }),
      ])
      return { items: items.map(serializeCampaign), total, page, perPage }
    },

    async update(id, data) {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: {
          ...(data.title !== undefined ? { title: data.title } : {}),
          ...(data.description !== undefined
            ? { description: data.description }
            : {}),
          ...(data.goalAmount !== undefined
            ? { goalAmount: data.goalAmount }
            : {}),
          ...(data.currency !== undefined ? { currency: data.currency } : {}),
          ...(data.petId !== undefined ? { petId: data.petId } : {}),
          ...(data.coverImageUrl !== undefined
            ? { coverImageUrl: data.coverImageUrl }
            : {}),
          ...(data.startsAt !== undefined
            ? { startsAt: data.startsAt ? new Date(data.startsAt) : null }
            : {}),
          ...(data.endsAt !== undefined
            ? { endsAt: data.endsAt ? new Date(data.endsAt) : null }
            : {}),
        },
        select: campaignSelect,
      })
      return serializeCampaign(campaign)
    },

    async submitForReview(id) {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: { status: 'PENDING_REVIEW' },
        select: campaignSelect,
      })
      return serializeCampaign(campaign)
    },

    async approve(id, approvedByUserId) {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: { status: 'APPROVED', approvedAt: new Date(), approvedByUserId },
        select: campaignSelect,
      })
      return serializeCampaign(campaign)
    },

    async reject(id, reviewNote) {
      const campaign = await prisma.campaign.update({
        where: { id },
        data: { status: 'REJECTED', reviewNote },
        select: campaignSelect,
      })
      return serializeCampaign(campaign)
    },

    async countDocuments(id) {
      return prisma.campaignDocument.count({ where: { campaignId: id } })
    },

    async listPublic(input) {
      const page = Math.max(1, input.page)
      const perPage = Math.min(20, Math.max(1, input.perPage))
      const skip = (page - 1) * perPage

      let workspaceIdFilter: { in: string[] } | undefined
      if (input.cityId) {
        const locations = await prisma.partnerWorkspaceLocation.findMany({
          where: { cityPlaceId: input.cityId },
          select: { workspaceId: true },
        })
        const ids = [...new Set(locations.map((l) => l.workspaceId))]
        workspaceIdFilter = { in: ids }
      }

      const where = {
        status: 'APPROVED' as const,
        workspace: { isActive: true, verificationStatus: 'APPROVED' as const },
        ...(workspaceIdFilter ? { workspaceId: workspaceIdFilter } : {}),
        ...(input.workspaceId ? { workspaceId: input.workspaceId } : {}),
        ...(input.petId ? { petId: input.petId } : {}),
      }

      const [rows, total] = await Promise.all([
        prisma.campaign.findMany({
          where,
          skip,
          take: perPage,
          orderBy: { approvedAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            goalAmount: true,
            currentAmount: true,
            currency: true,
            coverImageUrl: true,
            endsAt: true,
            approvedAt: true,
            workspace: { select: { id: true, name: true, type: true } },
            pet: { select: { id: true, name: true, species: true } },
          },
        }),
        prisma.campaign.count({ where }),
      ])

      return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: rows.map((c: any) => ({
          id: c.id,
          title: c.title,
          description: c.description,
          goalAmount: String(c.goalAmount),
          currentAmount: String(c.currentAmount),
          currency: c.currency,
          coverImageUrl: c.coverImageUrl,
          endsAt: c.endsAt,
          approvedAt: c.approvedAt,
          workspace: {
            id: c.workspace.id,
            name: c.workspace.name,
            type: String(c.workspace.type),
          },
          pet: c.pet
            ? { id: c.pet.id, name: c.pet.name, species: String(c.pet.species) }
            : null,
        })),
        total,
        page,
        perPage,
      }
    },
  }
}
