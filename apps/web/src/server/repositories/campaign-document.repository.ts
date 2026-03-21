import type { PrismaClient } from '~/generated/prisma/client'

export interface CampaignDocumentItem {
  id: string
  campaignId: string
  type: string
  title: string
  description: string
  fileUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
  status: string
  reviewedAt: Date | null
  reviewedByUserId: string | null
  createdAt: Date
}

export interface CreateCampaignDocumentData {
  campaignId: string
  type: string
  title: string
  description: string
  fileUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
}

export interface CampaignDocumentRepository {
  create(data: CreateCampaignDocumentData): Promise<CampaignDocumentItem>
  findById(id: string): Promise<
    | (CampaignDocumentItem & {
        campaign: { workspaceId: string; status: string }
      })
    | null
  >
  delete(id: string): Promise<void>
}

export function createCampaignDocumentRepository(
  prisma: PrismaClient,
): CampaignDocumentRepository {
  return {
    async create(data) {
      return prisma.campaignDocument.create({
        data: {
          campaignId: data.campaignId,
          type: data.type as never,
          title: data.title,
          description: data.description,
          fileUrl: data.fileUrl,
          storagePath: data.storagePath,
          mimeType: data.mimeType,
          fileSize: data.fileSize,
        },
        select: {
          id: true,
          campaignId: true,
          type: true,
          title: true,
          description: true,
          fileUrl: true,
          storagePath: true,
          mimeType: true,
          fileSize: true,
          status: true,
          reviewedAt: true,
          reviewedByUserId: true,
          createdAt: true,
        },
      })
    },

    async findById(id) {
      return prisma.campaignDocument.findUnique({
        where: { id },
        select: {
          id: true,
          campaignId: true,
          type: true,
          title: true,
          description: true,
          fileUrl: true,
          storagePath: true,
          mimeType: true,
          fileSize: true,
          status: true,
          reviewedAt: true,
          reviewedByUserId: true,
          createdAt: true,
          campaign: { select: { workspaceId: true, status: true } },
        },
      })
    },

    async delete(id) {
      await prisma.campaignDocument.delete({ where: { id } })
    },
  }
}
