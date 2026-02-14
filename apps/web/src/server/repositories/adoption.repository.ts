import type { PrismaClient } from '~/generated/prisma/client'

export interface CreateAdoptionData {
  petId: string
  guardianUserId: string
  workspaceId: string
  adoptedAt: Date
  notes?: string | null
  createdByUserId: string
}

export interface CreatedAdoptionItem {
  id: string
  petId: string
  workspaceId: string
  guardianUserId: string
  adoptedAt: Date
  notes: string | null
  status: string
  createdByUserId: string
  createdAt: Date
}

function addDays(date: Date, days: number): Date {
  const r = new Date(date)
  r.setUTCDate(r.getUTCDate() + days)
  return r
}

function addMonths(date: Date, months: number): Date {
  const r = new Date(date)
  r.setUTCMonth(r.getUTCMonth() + months)
  return r
}

function addYears(date: Date, years: number): Date {
  const r = new Date(date)
  r.setUTCFullYear(r.getUTCFullYear() + years)
  return r
}

export interface AdoptionRepository {
  create(data: CreateAdoptionData): Promise<CreatedAdoptionItem>
}

export function createAdoptionRepository(
  prisma: PrismaClient,
): AdoptionRepository {
  return {
    async create(data) {
      const adoption = await prisma.$transaction(async (tx) => {
        const created = await tx.adoption.create({
          data: {
            petId: data.petId,
            workspaceId: data.workspaceId,
            guardianUserId: data.guardianUserId,
            adoptedAt: data.adoptedAt,
            notes: data.notes ?? null,
            createdByUserId: data.createdByUserId,
          },
          select: {
            id: true,
            petId: true,
            workspaceId: true,
            guardianUserId: true,
            adoptedAt: true,
            notes: true,
            status: true,
            createdByUserId: true,
            createdAt: true,
          },
        })

        await tx.pet.update({
          where: { id: data.petId },
          data: { status: 'ADOPTED' },
        })

        const adoptedAt = data.adoptedAt
        await tx.adoptionFollowUp.createMany({
          data: [
            {
              adoptionId: created.id,
              type: 'DAYS_30',
              scheduledAt: addDays(adoptedAt, 30),
              status: 'PENDING',
            },
            {
              adoptionId: created.id,
              type: 'MONTHS_6',
              scheduledAt: addMonths(adoptedAt, 6),
              status: 'PENDING',
            },
            {
              adoptionId: created.id,
              type: 'YEAR_1',
              scheduledAt: addYears(adoptedAt, 1),
              status: 'PENDING',
            },
          ],
        })

        await tx.auditLog.create({
          data: {
            actorUserId: data.createdByUserId,
            action: 'CREATE',
            entityType: 'ADOPTION',
            entityId: created.id,
            metadata: {
              petId: data.petId,
              guardianUserId: data.guardianUserId,
              adoptedAt: adoptedAt.toISOString(),
            },
          },
        })

        await tx.auditLog.create({
          data: {
            actorUserId: data.createdByUserId,
            action: 'STATUS_CHANGE',
            entityType: 'PET',
            entityId: data.petId,
            metadata: {
              from: 'APPROVED',
              to: 'ADOPTED',
              adoptionId: created.id,
            },
          },
        })

        return created
      })

      return {
        ...adoption,
        notes: adoption.notes,
      }
    },
  }
}
