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

export interface AdoptionForAccessItem {
  guardianUserId: string
  workspaceId: string
  workspaceCityIds: string[]
}

export interface AdoptionDetailsItem {
  id: string
  petId: string
  workspaceId: string
  guardianUserId: string
  adoptedAt: Date
  notes: string | null
  status: string
  createdAt: Date
  pet: {
    id: string
    name: string
    description: string
    species: string
    sex: string
    size: string
    ageCategory: string
  }
  guardian: {
    id: string
    fullName: string
    email: string
  }
  workspace: {
    id: string
    name: string
  }
  followUps: Array<{
    id: string
    type: string
    status: string
    scheduledAt: Date
    currentSubmission: {
      id: string
      status: string
      submittedAt: Date
    } | null
  }>
}

export interface AdoptionRepository {
  create(data: CreateAdoptionData): Promise<CreatedAdoptionItem>
  findByIdForAccess(id: string): Promise<AdoptionForAccessItem | null>
  findByIdWithDetails(id: string): Promise<AdoptionDetailsItem | null>
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

    async findByIdForAccess(id) {
      const adoption = await prisma.adoption.findUnique({
        where: { id },
        select: {
          guardianUserId: true,
          workspaceId: true,
          workspace: {
            select: {
              locations: {
                where: { isPrimary: true },
                select: { cityPlaceId: true },
              },
              cityCoverage: { select: { cityPlaceId: true } },
            },
          },
        },
      })
      if (!adoption) return null

      const cityIds = new Set<string>()
      adoption.workspace.locations.forEach((l) => cityIds.add(l.cityPlaceId))
      adoption.workspace.cityCoverage.forEach((c) => cityIds.add(c.cityPlaceId))

      return {
        guardianUserId: adoption.guardianUserId,
        workspaceId: adoption.workspaceId,
        workspaceCityIds: Array.from(cityIds),
      }
    },

    async findByIdWithDetails(id) {
      const adoption = await prisma.adoption.findUnique({
        where: { id },
        select: {
          id: true,
          petId: true,
          workspaceId: true,
          guardianUserId: true,
          adoptedAt: true,
          notes: true,
          status: true,
          createdAt: true,
          pet: {
            select: {
              id: true,
              name: true,
              description: true,
              species: true,
              sex: true,
              size: true,
              ageCategory: true,
            },
          },
          guardian: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          followUps: {
            select: {
              id: true,
              type: true,
              status: true,
              scheduledAt: true,
              currentSubmission: {
                select: {
                  id: true,
                  status: true,
                  submittedAt: true,
                },
              },
            },
            orderBy: { type: 'asc' },
          },
        },
      })
      if (!adoption) return null

      return {
        id: adoption.id,
        petId: adoption.petId,
        workspaceId: adoption.workspaceId,
        guardianUserId: adoption.guardianUserId,
        adoptedAt: adoption.adoptedAt,
        notes: adoption.notes,
        status: adoption.status,
        createdAt: adoption.createdAt,
        pet: adoption.pet,
        guardian: adoption.guardian,
        workspace: adoption.workspace,
        followUps: adoption.followUps.map((f) => ({
          id: f.id,
          type: f.type,
          status: f.status,
          scheduledAt: f.scheduledAt,
          currentSubmission: f.currentSubmission,
        })),
      }
    },
  }
}
