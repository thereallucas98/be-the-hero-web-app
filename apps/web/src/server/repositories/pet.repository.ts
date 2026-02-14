import type { PrismaClient } from '~/generated/prisma/client'

export interface CreatePetData {
  workspaceId: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  energyLevel?: string
  independenceLevel?: string
  environment?: string
  adoptionRequirements?: string
}

export interface UpdatePetData {
  name?: string
  description?: string
  species?: string
  sex?: string
  size?: string
  ageCategory?: string
  energyLevel?: string
  independenceLevel?: string
  environment?: string
  adoptionRequirements?: string
}

export interface PetImageItem {
  id: string
  position: number
  isCover: boolean
}

export interface PetWithWorkspaceItem {
  id: string
  workspaceId: string
  status: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  energyLevel: string | null
  independenceLevel: string | null
  environment: string | null
  adoptionRequirements: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatedPetItem {
  id: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  energyLevel: string | null
  independenceLevel: string | null
  environment: string | null
  adoptionRequirements: string | null
  status: string
  workspaceId: string
  createdAt: Date
  updatedAt: Date
}

export interface PetWithImagesAndWorkspaceItem extends PetWithWorkspaceItem {
  images: PetImageItem[]
  workspace: { isActive: boolean; verificationStatus: string }
}

export interface PetRepository {
  create(data: CreatePetData): Promise<CreatedPetItem>
  findByIdWithWorkspace(id: string): Promise<PetWithWorkspaceItem | null>
  findByIdWithImagesAndWorkspace(
    id: string,
  ): Promise<PetWithImagesAndWorkspaceItem | null>
  update(id: string, data: UpdatePetData): Promise<CreatedPetItem | null>
  submitForReview(
    id: string,
    actorUserId: string,
  ): Promise<CreatedPetItem | null>
}

export function createPetRepository(prisma: PrismaClient): PetRepository {
  return {
    async create(data) {
      const pet = await prisma.pet.create({
        data: {
          workspaceId: data.workspaceId,
          name: data.name,
          description: data.description,
          species: data.species as
            | 'DOG'
            | 'CAT'
            | 'RABBIT'
            | 'BIRD'
            | 'HORSE'
            | 'COW'
            | 'GOAT'
            | 'PIG'
            | 'TURTLE'
            | 'OTHER',
          sex: data.sex as 'MALE' | 'FEMALE',
          size: data.size as 'SMALL' | 'MEDIUM' | 'LARGE',
          ageCategory: data.ageCategory as
            | 'PUPPY'
            | 'YOUNG'
            | 'ADULT'
            | 'SENIOR',
          energyLevel: (data.energyLevel as 'LOW' | 'MEDIUM' | 'HIGH') ?? null,
          independenceLevel:
            (data.independenceLevel as 'LOW' | 'MEDIUM' | 'HIGH') ?? null,
          environment:
            (data.environment as 'HOUSE' | 'APARTMENT' | 'BOTH') ?? null,
          adoptionRequirements: data.adoptionRequirements ?? null,
          status: 'DRAFT',
        },
        select: {
          id: true,
          name: true,
          description: true,
          species: true,
          sex: true,
          size: true,
          ageCategory: true,
          energyLevel: true,
          independenceLevel: true,
          environment: true,
          adoptionRequirements: true,
          status: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        ...pet,
        energyLevel: pet.energyLevel,
        independenceLevel: pet.independenceLevel,
        environment: pet.environment,
        adoptionRequirements: pet.adoptionRequirements,
      }
    },

    async findByIdWithWorkspace(id) {
      const pet = await prisma.pet.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          workspaceId: true,
          status: true,
          name: true,
          description: true,
          species: true,
          sex: true,
          size: true,
          ageCategory: true,
          energyLevel: true,
          independenceLevel: true,
          environment: true,
          adoptionRequirements: true,
          createdAt: true,
          updatedAt: true,
        },
      })
      return pet
    },

    async findByIdWithImagesAndWorkspace(id) {
      const pet = await prisma.pet.findUnique({
        where: { id, isActive: true },
        select: {
          id: true,
          workspaceId: true,
          status: true,
          name: true,
          description: true,
          species: true,
          sex: true,
          size: true,
          ageCategory: true,
          energyLevel: true,
          independenceLevel: true,
          environment: true,
          adoptionRequirements: true,
          createdAt: true,
          updatedAt: true,
          images: {
            select: { id: true, position: true, isCover: true },
          },
          workspace: {
            select: { isActive: true, verificationStatus: true },
          },
        },
      })
      if (!pet) return null
      return {
        ...pet,
        images: pet.images,
        workspace: pet.workspace,
      }
    },

    async submitForReview(id, actorUserId) {
      const pet = await prisma.$transaction(async (tx) => {
        const updated = await tx.pet.update({
          where: { id },
          data: { status: 'PENDING_REVIEW' },
          select: {
            id: true,
            name: true,
            description: true,
            species: true,
            sex: true,
            size: true,
            ageCategory: true,
            energyLevel: true,
            independenceLevel: true,
            environment: true,
            adoptionRequirements: true,
            status: true,
            workspaceId: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'SUBMIT_FOR_REVIEW',
            entityType: 'PET',
            entityId: id,
            metadata: {},
          },
        })
        return updated
      })
      return {
        ...pet,
        energyLevel: pet.energyLevel,
        independenceLevel: pet.independenceLevel,
        environment: pet.environment,
        adoptionRequirements: pet.adoptionRequirements,
      }
    },

    async update(id, data) {
      const hasChanges = Object.keys(data).some(
        (k) => data[k as keyof UpdatePetData] !== undefined,
      )
      if (!hasChanges) {
        const existing = await prisma.pet.findUnique({
          where: { id, isActive: true },
          select: {
            id: true,
            name: true,
            description: true,
            species: true,
            sex: true,
            size: true,
            ageCategory: true,
            energyLevel: true,
            independenceLevel: true,
            environment: true,
            adoptionRequirements: true,
            status: true,
            workspaceId: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        return existing
          ? {
              ...existing,
              energyLevel: existing.energyLevel,
              independenceLevel: existing.independenceLevel,
              environment: existing.environment,
              adoptionRequirements: existing.adoptionRequirements,
            }
          : null
      }

      const updateData: {
        name?: string
        description?: string
        species?:
          | 'DOG'
          | 'CAT'
          | 'RABBIT'
          | 'BIRD'
          | 'HORSE'
          | 'COW'
          | 'GOAT'
          | 'PIG'
          | 'TURTLE'
          | 'OTHER'
        sex?: 'MALE' | 'FEMALE'
        size?: 'SMALL' | 'MEDIUM' | 'LARGE'
        ageCategory?: 'PUPPY' | 'YOUNG' | 'ADULT' | 'SENIOR'
        energyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
        independenceLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | null
        environment?: 'HOUSE' | 'APARTMENT' | 'BOTH' | null
        adoptionRequirements?: string | null
      } = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined)
        updateData.description = data.description
      if (data.species !== undefined)
        updateData.species = data.species as typeof updateData.species
      if (data.sex !== undefined)
        updateData.sex = data.sex as typeof updateData.sex
      if (data.size !== undefined)
        updateData.size = data.size as typeof updateData.size
      if (data.ageCategory !== undefined)
        updateData.ageCategory =
          data.ageCategory as typeof updateData.ageCategory
      if (data.energyLevel !== undefined)
        updateData.energyLevel =
          (data.energyLevel as typeof updateData.energyLevel) || null
      if (data.independenceLevel !== undefined)
        updateData.independenceLevel =
          (data.independenceLevel as typeof updateData.independenceLevel) ||
          null
      if (data.environment !== undefined)
        updateData.environment =
          (data.environment as typeof updateData.environment) || null
      if (data.adoptionRequirements !== undefined)
        updateData.adoptionRequirements = data.adoptionRequirements || null

      const pet = await prisma.pet.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          name: true,
          description: true,
          species: true,
          sex: true,
          size: true,
          ageCategory: true,
          energyLevel: true,
          independenceLevel: true,
          environment: true,
          adoptionRequirements: true,
          status: true,
          workspaceId: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return {
        ...pet,
        energyLevel: pet.energyLevel,
        independenceLevel: pet.independenceLevel,
        environment: pet.environment,
        adoptionRequirements: pet.adoptionRequirements,
      }
    },
  }
}
