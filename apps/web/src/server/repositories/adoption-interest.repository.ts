import type { PrismaClient } from '~/generated/prisma/client'

export interface CreateAdoptionInterestData {
  petId: string
  userId: string
  workspaceId: string
  message?: string | null
}

export interface CreatedAdoptionInterestItem {
  id: string
  petId: string
  workspaceId: string
  message: string | null
  createdAt: Date
}

export interface AdoptionInterestRepository {
  create(
    data: CreateAdoptionInterestData,
    actorUserId: string,
  ): Promise<CreatedAdoptionInterestItem>
}

export function createAdoptionInterestRepository(
  prisma: PrismaClient,
): AdoptionInterestRepository {
  return {
    async create(data, actorUserId) {
      const interest = await prisma.$transaction(async (tx) => {
        const created = await tx.adoptionInterest.create({
          data: {
            petId: data.petId,
            userId: data.userId,
            workspaceId: data.workspaceId,
            message: data.message ?? null,
          },
          select: {
            id: true,
            petId: true,
            workspaceId: true,
            message: true,
            createdAt: true,
          },
        })
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'CREATE',
            entityType: 'ADOPTION_INTEREST',
            entityId: created.id,
            metadata: { petId: data.petId, workspaceId: data.workspaceId },
          },
        })
        return created
      })
      return interest
    },
  }
}
