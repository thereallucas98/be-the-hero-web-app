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

export interface WorkspaceInterestListItem {
  id: string
  message: string | null
  createdAt: Date
  pet: {
    id: string
    name: string
    species: string
    sex: string
    size: string
    ageCategory: string
  }
  user: {
    id: string
    fullName: string
    email: string
  }
}

export interface ListByWorkspaceInput {
  workspaceId: string
  page: number
  perPage: number
}

export interface ListByWorkspaceResult {
  items: WorkspaceInterestListItem[]
  total: number
  page: number
  perPage: number
}

export interface InterestItem {
  id: string
  userId: string
  petId: string
  workspaceId: string
  message: string | null
  createdAt: Date
}

export interface InterestForWorkspaceItem {
  id: string
  userId: string
  petId: string
  workspaceId: string
}

export interface MyInterestListItem {
  id: string
  message: string | null
  channel: string
  createdAt: Date
  pet: {
    id: string
    name: string
    species: string
    sex: string
    size: string
    ageCategory: string
    coverImage: { url: string } | null
  }
}

export interface ListMyInterestsInput {
  page: number
  perPage: number
}

export interface ListMyInterestsResult {
  items: MyInterestListItem[]
  total: number
  page: number
  perPage: number
}

export interface AdoptionInterestRepository {
  create(
    data: CreateAdoptionInterestData,
    actorUserId: string,
  ): Promise<CreatedAdoptionInterestItem>
  listByWorkspace(input: ListByWorkspaceInput): Promise<ListByWorkspaceResult>
  findById(id: string): Promise<InterestItem | null>
  findByIdForWorkspace(
    id: string,
    workspaceId: string,
  ): Promise<InterestForWorkspaceItem | null>
  findByUserId(
    userId: string,
    input: ListMyInterestsInput,
  ): Promise<ListMyInterestsResult>
  deleteById(id: string): Promise<void>
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

    async listByWorkspace(input) {
      const { workspaceId, page, perPage } = input

      const [rows, total] = await Promise.all([
        prisma.adoptionInterest.findMany({
          where: { workspaceId },
          select: {
            id: true,
            message: true,
            createdAt: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                sex: true,
                size: true,
                ageCategory: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.adoptionInterest.count({ where: { workspaceId } }),
      ])

      const items: WorkspaceInterestListItem[] = rows.map((r) => ({
        id: r.id,
        message: r.message,
        createdAt: r.createdAt,
        pet: r.pet,
        user: r.user,
      }))

      return { items, total, page, perPage }
    },

    async findById(id) {
      return prisma.adoptionInterest.findUnique({
        where: { id },
        select: {
          id: true,
          userId: true,
          petId: true,
          workspaceId: true,
          message: true,
          createdAt: true,
        },
      })
    },

    async findByIdForWorkspace(id, workspaceId) {
      return prisma.adoptionInterest.findFirst({
        where: { id, workspaceId },
        select: {
          id: true,
          userId: true,
          petId: true,
          workspaceId: true,
        },
      })
    },

    async findByUserId(userId, input) {
      const { page, perPage } = input

      const [rows, total] = await Promise.all([
        prisma.adoptionInterest.findMany({
          where: { userId },
          select: {
            id: true,
            message: true,
            channel: true,
            createdAt: true,
            pet: {
              select: {
                id: true,
                name: true,
                species: true,
                sex: true,
                size: true,
                ageCategory: true,
                images: {
                  where: { isCover: true },
                  take: 1,
                  select: { url: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.adoptionInterest.count({ where: { userId } }),
      ])

      return {
        items: rows.map((r) => ({
          id: r.id,
          message: r.message,
          channel: r.channel,
          createdAt: r.createdAt,
          pet: {
            id: r.pet.id,
            name: r.pet.name,
            species: r.pet.species,
            sex: r.pet.sex,
            size: r.pet.size,
            ageCategory: r.pet.ageCategory,
            coverImage: r.pet.images[0] ? { url: r.pet.images[0].url } : null,
          },
        })),
        total,
        page,
        perPage,
      }
    },

    async deleteById(id) {
      await prisma.adoptionInterest.delete({ where: { id } })
    },
  }
}
