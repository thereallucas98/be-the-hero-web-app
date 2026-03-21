import type { PrismaClient } from '~/generated/prisma/client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DonationItem {
  id: string
  campaignId: string
  workspaceId: string
  userId: string
  amount: string
  currency: string
  paymentMethod: string
  proofUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
  status: string
  reviewedAt: Date | null
  reviewedByUserId: string | null
  reviewNote: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateDonationData {
  campaignId: string
  workspaceId: string
  userId: string
  amount: number
  currency?: string
  paymentMethod: string
  proofUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
}

export interface ListDonationsInput {
  campaignId?: string
  workspaceId?: string
  userId?: string
  status?: string
  page: number
  perPage: number
}

export interface ListDonationsResult {
  items: DonationItem[]
  total: number
  page: number
  perPage: number
}

export interface DonationRepository {
  create(data: CreateDonationData): Promise<DonationItem>
  findById(
    id: string,
  ): Promise<
    | (DonationItem & { campaign: { workspaceId: string; status: string } })
    | null
  >
  listByCampaign(
    campaignId: string,
    input: { status?: string; page: number; perPage: number },
  ): Promise<ListDonationsResult>
  listForAdmin(input: ListDonationsInput): Promise<ListDonationsResult>
  approve(id: string, reviewedByUserId: string): Promise<DonationItem>
  reject(
    id: string,
    reviewedByUserId: string,
    reviewNote: string,
  ): Promise<DonationItem>
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const donationSelect = {
  id: true,
  campaignId: true,
  workspaceId: true,
  userId: true,
  amount: true,
  currency: true,
  paymentMethod: true,
  proofUrl: true,
  storagePath: true,
  mimeType: true,
  fileSize: true,
  status: true,
  reviewedAt: true,
  reviewedByUserId: true,
  reviewNote: true,
  createdAt: true,
  updatedAt: true,
} as const

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeDonation(d: any): DonationItem {
  return { ...d, amount: String(d.amount) }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createDonationRepository(
  prisma: PrismaClient,
): DonationRepository {
  return {
    async create(data) {
      const donation = await prisma.donation.create({
        data: {
          campaignId: data.campaignId,
          workspaceId: data.workspaceId,
          userId: data.userId,
          amount: data.amount,
          currency: data.currency ?? 'BRL',
          paymentMethod: data.paymentMethod as never,
          proofUrl: data.proofUrl,
          storagePath: data.storagePath,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
        },
        select: donationSelect,
      })
      return serializeDonation(donation)
    },

    async findById(id) {
      return prisma.donation.findUnique({
        where: { id },
        select: {
          ...donationSelect,
          campaign: { select: { workspaceId: true, status: true } },
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      }) as any
    },

    async listByCampaign(campaignId, { status, page, perPage }) {
      const where = {
        campaignId,
        ...(status ? { status: status as never } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          select: donationSelect,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.donation.count({ where }),
      ])
      return { items: items.map(serializeDonation), total, page, perPage }
    },

    async listForAdmin({
      campaignId,
      workspaceId,
      userId,
      status,
      page,
      perPage,
    }) {
      const where = {
        ...(campaignId ? { campaignId } : {}),
        ...(workspaceId ? { workspaceId } : {}),
        ...(userId ? { userId } : {}),
        ...(status ? { status: status as never } : {}),
      }
      const [items, total] = await Promise.all([
        prisma.donation.findMany({
          where,
          select: donationSelect,
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.donation.count({ where }),
      ])
      return { items: items.map(serializeDonation), total, page, perPage }
    },

    async approve(id, reviewedByUserId) {
      const donation = await prisma.donation.update({
        where: { id },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedByUserId,
        },
        select: donationSelect,
      })
      // Also increment campaign currentAmount
      const d = serializeDonation(donation)
      await prisma.campaign.update({
        where: { id: d.campaignId },
        data: { currentAmount: { increment: Number(d.amount) } },
      })
      return d
    },

    async reject(id, reviewedByUserId, reviewNote) {
      const donation = await prisma.donation.update({
        where: { id },
        data: {
          status: 'REJECTED',
          reviewedAt: new Date(),
          reviewedByUserId,
          reviewNote,
        },
        select: donationSelect,
      })
      return serializeDonation(donation)
    },
  }
}
