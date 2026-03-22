import { Prisma } from '~/generated/prisma/client'
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

export interface PetWithImagesAndWorkspaceForAdminItem extends PetWithWorkspaceItem {
  images: PetImageItem[]
  workspace: {
    isActive: boolean
    verificationStatus: string
    workspaceCityIds: string[]
  }
}

export interface ApprovedPetItem extends CreatedPetItem {
  approvedAt: Date
  approvedByUserId: string
}

export interface RejectedPetItem extends CreatedPetItem {
  approvedAt: Date | null
  approvedByUserId: string | null
}

export interface PublicPetListItem {
  id: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  coverImage: { url: string } | null
  workspace: { id: string; name: string }
}

export interface ListPublicPetsInput {
  cityPlaceId?: string
  workspaceId?: string
  species?: string
  sex?: string
  size?: string
  ageCategory?: string
  hasRequirements?: boolean
  page?: number
  perPage?: number
}

export interface PublicPetRequirementItem {
  id: string
  category: string
  title: string
  description: string | null
  isMandatory: boolean
  order: number
}

export interface PublicPetDetailItem {
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
  images: Array<{ id: string; url: string; position: number; isCover: boolean }>
  requirements: PublicPetRequirementItem[]
  workspace: { id: string; name: string }
  approvedAt: Date
}

export interface AddPetRequirementData {
  category: string
  title: string
  description?: string
  isMandatory?: boolean
  order: number
}

export interface UpdatePetRequirementData {
  category?: string
  title?: string
  description?: string
  isMandatory?: boolean
  order?: number
}

export interface PetRequirementItem {
  id: string
  petId: string
  category: string
  title: string
  description: string | null
  isMandatory: boolean
  order: number
}

export interface WorkspacePetListItem {
  id: string
  name: string
  species: string
  sex: string
  size: string
  ageCategory: string
  status: string
  coverImage: { url: string } | null
  createdAt: Date
  updatedAt: Date
}

export interface ListWorkspacePetsInput {
  status?: string
  page?: number
  perPage?: number
}

export interface ListWorkspacePetsResult {
  items: WorkspacePetListItem[]
  total: number
  page: number
  perPage: number
}

export interface PetForTrackingItem {
  id: string
  workspaceId: string
  status: string
}

export interface ListPublicPetsResult {
  items: PublicPetListItem[]
  total: number
  page: number
  perPage: number
}

export interface PetForInterestItem {
  workspaceId: string
  status: string
  isActive: boolean
  workspace: { isActive: boolean; verificationStatus: string }
}

export interface PetForAdoptionItem {
  workspaceId: string
  status: string
  workspace: { isActive: boolean; verificationStatus: string }
  hasAdoption: boolean
}

export interface AddPetImageData {
  url: string
  storagePath: string
  position: number
  isCover: boolean
}

export interface CreatedPetImageItem {
  id: string
  url: string
  storagePath: string
  position: number
  isCover: boolean
  status: string
}

export type AddPetImageResult =
  | { success: true; image: CreatedPetImageItem }
  | {
      success: false
      code: 'MAX_IMAGES_REACHED' | 'POSITION_ALREADY_TAKEN' | 'PET_NOT_FOUND'
    }

export interface UpdatePetImageData {
  position?: number
  isCover?: boolean
}

export type UpdatePetImageResult =
  | { success: true; image: CreatedPetImageItem }
  | {
      success: false
      code: 'IMAGE_NOT_FOUND' | 'POSITION_ALREADY_TAKEN'
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
  countImages(petId: string): Promise<number>
  addPetImage(
    petId: string,
    data: AddPetImageData,
    actorUserId: string,
  ): Promise<AddPetImageResult>
  findImageByIdAndPetId(
    imageId: string,
    petId: string,
  ): Promise<{ id: string; position: number; isCover: boolean } | null>
  updatePetImage(
    imageId: string,
    petId: string,
    data: UpdatePetImageData,
    actorUserId: string,
  ): Promise<UpdatePetImageResult>
  deletePetImage(
    imageId: string,
    petId: string,
    actorUserId: string,
  ): Promise<
    | { success: true }
    | {
        success: false
        code: 'IMAGE_NOT_FOUND' | 'CANNOT_REMOVE_LAST_IMAGE'
      }
  >
  findByIdWithImagesAndWorkspaceForAdmin(
    id: string,
  ): Promise<PetWithImagesAndWorkspaceForAdminItem | null>
  approvePet(id: string, actorUserId: string): Promise<ApprovedPetItem | null>
  rejectPet(
    id: string,
    actorUserId: string,
    reviewNote: string,
  ): Promise<RejectedPetItem | null>
  listPublicPets(input: ListPublicPetsInput): Promise<ListPublicPetsResult>
  findByIdForInterest(id: string): Promise<PetForInterestItem | null>
  findByIdForAdoption(id: string): Promise<PetForAdoptionItem | null>
  findByIdPublic(id: string): Promise<PublicPetDetailItem | null>
  listByWorkspace(
    workspaceId: string,
    input: ListWorkspacePetsInput,
  ): Promise<ListWorkspacePetsResult>
  addRequirement(
    petId: string,
    data: AddPetRequirementData,
  ): Promise<PetRequirementItem>
  findRequirementById(
    reqId: string,
    petId: string,
  ): Promise<PetRequirementItem | null>
  updateRequirement(
    reqId: string,
    petId: string,
    data: UpdatePetRequirementData,
  ): Promise<PetRequirementItem | null>
  removeRequirement(reqId: string, petId: string): Promise<boolean>
  findByIdForTracking(id: string): Promise<PetForTrackingItem | null>
  trackEvent(petId: string, workspaceId: string, type: string): Promise<void>
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

    async countImages(petId) {
      return prisma.petImage.count({ where: { petId } })
    },

    async addPetImage(petId, data, actorUserId) {
      try {
        const pet = await prisma.pet.findUnique({
          where: { id: petId, isActive: true },
        })
        if (!pet) {
          return { success: false, code: 'PET_NOT_FOUND' }
        }

        const imageCount = await prisma.petImage.count({ where: { petId } })
        if (imageCount >= 5) {
          return { success: false, code: 'MAX_IMAGES_REACHED' }
        }

        const image = await prisma.$transaction(async (tx) => {
          if (data.isCover) {
            await tx.petImage.updateMany({
              where: { petId },
              data: { isCover: false },
            })
          }

          const created = await tx.petImage.create({
            data: {
              petId,
              url: data.url,
              storagePath: data.storagePath,
              position: data.position,
              isCover: data.isCover,
              status: 'PENDING_REVIEW',
            },
            select: {
              id: true,
              url: true,
              storagePath: true,
              position: true,
              isCover: true,
              status: true,
            },
          })

          await tx.auditLog.create({
            data: {
              actorUserId,
              action: 'CREATE',
              entityType: 'PET_IMAGE',
              entityId: created.id,
              metadata: { petId },
            },
          })

          return created
        })

        return {
          success: true as const,
          image: {
            id: image.id,
            url: image.url,
            storagePath: image.storagePath,
            position: image.position,
            isCover: image.isCover,
            status: image.status,
          },
        }
      } catch (e: unknown) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          return { success: false, code: 'POSITION_ALREADY_TAKEN' }
        }
        throw e
      }
    },

    async findImageByIdAndPetId(imageId, petId) {
      const image = await prisma.petImage.findFirst({
        where: { id: imageId, petId },
        select: { id: true, position: true, isCover: true },
      })
      return image
    },

    async updatePetImage(imageId, petId, data, actorUserId) {
      try {
        const currentImage = await prisma.petImage.findFirst({
          where: { id: imageId, petId },
        })
        if (!currentImage) {
          return { success: false, code: 'IMAGE_NOT_FOUND' }
        }

        const image = await prisma.$transaction(async (tx) => {
          if (
            data.position !== undefined &&
            data.position !== currentImage.position
          ) {
            const imageAtTarget = await tx.petImage.findFirst({
              where: { petId, position: data.position, id: { not: imageId } },
            })
            if (imageAtTarget) {
              await tx.petImage.update({
                where: { id: imageAtTarget.id },
                data: { position: currentImage.position },
              })
            }
          }

          if (data.isCover === true) {
            await tx.petImage.updateMany({
              where: { petId, id: { not: imageId } },
              data: { isCover: false },
            })
          }

          const updateData: { position?: number; isCover?: boolean } = {}
          if (data.position !== undefined) updateData.position = data.position
          if (data.isCover !== undefined) updateData.isCover = data.isCover

          if (Object.keys(updateData).length === 0) {
            return tx.petImage.findUnique({
              where: { id: imageId },
              select: {
                id: true,
                url: true,
                storagePath: true,
                position: true,
                isCover: true,
                status: true,
              },
            })
          }

          const updated = await tx.petImage.update({
            where: { id: imageId },
            data: updateData,
            select: {
              id: true,
              url: true,
              storagePath: true,
              position: true,
              isCover: true,
              status: true,
            },
          })

          await tx.auditLog.create({
            data: {
              actorUserId,
              action: 'UPDATE',
              entityType: 'PET_IMAGE',
              entityId: imageId,
              metadata: { petId, updatedFields: Object.keys(updateData) },
            },
          })

          return updated
        })

        if (!image) {
          return { success: false, code: 'IMAGE_NOT_FOUND' }
        }

        return {
          success: true as const,
          image: {
            id: image.id,
            url: image.url,
            storagePath: image.storagePath,
            position: image.position,
            isCover: image.isCover,
            status: image.status,
          },
        }
      } catch (e: unknown) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2002'
        ) {
          return { success: false, code: 'POSITION_ALREADY_TAKEN' }
        }
        throw e
      }
    },

    async deletePetImage(imageId, petId, actorUserId) {
      const image = await prisma.petImage.findFirst({
        where: { id: imageId, petId },
        select: { id: true, isCover: true, storagePath: true },
      })
      if (!image) {
        return { success: false, code: 'IMAGE_NOT_FOUND' }
      }

      const imageCount = await prisma.petImage.count({ where: { petId } })
      const pet = await prisma.pet.findUnique({
        where: { id: petId },
        select: { status: true },
      })
      if (imageCount <= 1 && pet?.status === 'PENDING_REVIEW') {
        return { success: false, code: 'CANNOT_REMOVE_LAST_IMAGE' }
      }

      await prisma.$transaction(async (tx) => {
        if (image.isCover) {
          const nextCover = await tx.petImage.findFirst({
            where: { petId, id: { not: imageId } },
            orderBy: { position: 'asc' },
          })
          if (nextCover) {
            await tx.petImage.update({
              where: { id: nextCover.id },
              data: { isCover: true },
            })
          }
        }

        await tx.petImage.delete({ where: { id: imageId } })

        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'DELETE',
            entityType: 'PET_IMAGE',
            entityId: imageId,
            metadata: { petId, storagePath: image.storagePath },
          },
        })
      })

      return { success: true }
    },

    async findByIdWithImagesAndWorkspaceForAdmin(id) {
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
            select: {
              isActive: true,
              verificationStatus: true,
              locations: {
                where: { isPrimary: true },
                select: { cityPlaceId: true },
              },
              cityCoverage: { select: { cityPlaceId: true } },
            },
          },
        },
      })
      if (!pet) return null

      const ws = pet.workspace
      const workspaceCityIds = new Set<string>()
      ws.locations.forEach((l) => workspaceCityIds.add(l.cityPlaceId))
      ws.cityCoverage.forEach((c) => workspaceCityIds.add(c.cityPlaceId))

      return {
        ...pet,
        images: pet.images,
        workspace: {
          isActive: ws.isActive,
          verificationStatus: ws.verificationStatus,
          workspaceCityIds: Array.from(workspaceCityIds),
        },
      }
    },

    async approvePet(id, actorUserId) {
      const pet = await prisma.$transaction(async (tx) => {
        const updated = await tx.pet.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            approvedByUserId: actorUserId,
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
            approvedAt: true,
            approvedByUserId: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'APPROVE',
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
        approvedAt: pet.approvedAt!,
        approvedByUserId: pet.approvedByUserId!,
      }
    },

    async rejectPet(id, actorUserId, reviewNote) {
      const pet = await prisma.$transaction(async (tx) => {
        const updated = await tx.pet.update({
          where: { id },
          data: {
            status: 'REJECTED',
            approvedAt: new Date(),
            approvedByUserId: actorUserId,
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
            approvedAt: true,
            approvedByUserId: true,
            createdAt: true,
            updatedAt: true,
          },
        })
        await tx.auditLog.create({
          data: {
            actorUserId,
            action: 'REJECT',
            entityType: 'PET',
            entityId: id,
            metadata: { reviewNote },
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
        approvedAt: pet.approvedAt,
        approvedByUserId: pet.approvedByUserId,
      }
    },

    async listPublicPets(input) {
      const page = Math.max(1, input.page ?? 1)
      const perPage = Math.min(20, Math.max(1, input.perPage ?? 20))

      const workspaceFilter: Record<string, unknown> = {
        isActive: true,
        verificationStatus: 'APPROVED',
      }
      if (input.cityPlaceId) {
        workspaceFilter.locations = {
          some: {
            isPrimary: true,
            cityPlaceId: input.cityPlaceId,
          },
        }
      }

      const where = {
        status: 'APPROVED' as const,
        isActive: true,
        workspace: workspaceFilter,
        ...(input.workspaceId && { workspaceId: input.workspaceId }),
        ...(input.species && {
          species: input.species as
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
        }),
        ...(input.sex && { sex: input.sex as 'MALE' | 'FEMALE' }),
        ...(input.size && { size: input.size as 'SMALL' | 'MEDIUM' | 'LARGE' }),
        ...(input.ageCategory && {
          ageCategory: input.ageCategory as
            | 'PUPPY'
            | 'YOUNG'
            | 'ADULT'
            | 'SENIOR',
        }),
        ...(input.hasRequirements === false && {
          requirements: { none: {} },
        }),
      }

      const [rows, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          select: {
            id: true,
            name: true,
            description: true,
            species: true,
            sex: true,
            size: true,
            ageCategory: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
            workspace: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.pet.count({ where }),
      ])

      const items: PublicPetListItem[] = rows.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        species: p.species,
        sex: p.sex,
        size: p.size,
        ageCategory: p.ageCategory,
        coverImage: p.images[0] ? { url: p.images[0].url } : null,
        workspace: p.workspace,
      }))

      return { items, total, page, perPage }
    },

    async findByIdForInterest(id) {
      const pet = await prisma.pet.findUnique({
        where: { id },
        select: {
          workspaceId: true,
          status: true,
          isActive: true,
          workspace: {
            select: { isActive: true, verificationStatus: true },
          },
        },
      })
      return pet
    },

    async findByIdForAdoption(id) {
      const pet = await prisma.pet.findUnique({
        where: { id },
        select: {
          workspaceId: true,
          status: true,
          workspace: {
            select: { isActive: true, verificationStatus: true },
          },
          adoption: { select: { id: true } },
        },
      })
      if (!pet) return null
      return {
        workspaceId: pet.workspaceId,
        status: pet.status,
        workspace: pet.workspace,
        hasAdoption: pet.adoption !== null,
      }
    },

    async findByIdPublic(id) {
      const pet = await prisma.pet.findUnique({
        where: { id, status: 'APPROVED', isActive: true },
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
          approvedAt: true,
          images: {
            select: { id: true, url: true, position: true, isCover: true },
            orderBy: { position: 'asc' },
          },
          requirements: {
            select: {
              id: true,
              category: true,
              title: true,
              description: true,
              isMandatory: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          workspace: { select: { id: true, name: true } },
        },
      })
      if (!pet || !pet.approvedAt) return null
      return {
        ...pet,
        approvedAt: pet.approvedAt,
      }
    },

    async listByWorkspace(workspaceId, input) {
      const page = Math.max(1, input.page ?? 1)
      const perPage = Math.min(50, Math.max(1, input.perPage ?? 20))

      const where = {
        workspaceId,
        ...(input.status && {
          status: input.status as
            | 'DRAFT'
            | 'PENDING_REVIEW'
            | 'APPROVED'
            | 'REJECTED'
            | 'ADOPTED',
        }),
      }

      const [rows, total] = await Promise.all([
        prisma.pet.findMany({
          where,
          select: {
            id: true,
            name: true,
            species: true,
            sex: true,
            size: true,
            ageCategory: true,
            status: true,
            images: {
              where: { isCover: true },
              take: 1,
              select: { url: true },
            },
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { createdAt: 'desc' },
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.pet.count({ where }),
      ])

      return {
        items: rows.map((p) => ({
          id: p.id,
          name: p.name,
          species: p.species,
          sex: p.sex,
          size: p.size,
          ageCategory: p.ageCategory,
          status: p.status,
          coverImage: p.images[0] ? { url: p.images[0].url } : null,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        })),
        total,
        page,
        perPage,
      }
    },

    async addRequirement(petId, data) {
      return prisma.petRequirement.create({
        data: {
          petId,
          category: data.category as
            | 'HOME'
            | 'EXPERIENCE'
            | 'TIME_AVAILABILITY'
            | 'FINANCIAL'
            | 'SAFETY'
            | 'HEALTH_CARE'
            | 'OTHER',
          title: data.title,
          description: data.description ?? null,
          isMandatory: data.isMandatory ?? true,
          order: data.order,
        },
        select: {
          id: true,
          petId: true,
          category: true,
          title: true,
          description: true,
          isMandatory: true,
          order: true,
        },
      })
    },

    async findRequirementById(reqId, petId) {
      return prisma.petRequirement.findFirst({
        where: { id: reqId, petId },
        select: {
          id: true,
          petId: true,
          category: true,
          title: true,
          description: true,
          isMandatory: true,
          order: true,
        },
      })
    },

    async updateRequirement(reqId, petId, data) {
      const existing = await prisma.petRequirement.findFirst({
        where: { id: reqId, petId },
      })
      if (!existing) return null

      const updateData: {
        category?:
          | 'HOME'
          | 'EXPERIENCE'
          | 'TIME_AVAILABILITY'
          | 'FINANCIAL'
          | 'SAFETY'
          | 'HEALTH_CARE'
          | 'OTHER'
        title?: string
        description?: string | null
        isMandatory?: boolean
        order?: number
      } = {}
      if (data.category !== undefined)
        updateData.category = data.category as typeof updateData.category
      if (data.title !== undefined) updateData.title = data.title
      if (data.description !== undefined)
        updateData.description = data.description ?? null
      if (data.isMandatory !== undefined)
        updateData.isMandatory = data.isMandatory
      if (data.order !== undefined) updateData.order = data.order

      return prisma.petRequirement.update({
        where: { id: reqId },
        data: updateData,
        select: {
          id: true,
          petId: true,
          category: true,
          title: true,
          description: true,
          isMandatory: true,
          order: true,
        },
      })
    },

    async removeRequirement(reqId, petId) {
      const existing = await prisma.petRequirement.findFirst({
        where: { id: reqId, petId },
      })
      if (!existing) return false
      await prisma.petRequirement.delete({ where: { id: reqId } })
      return true
    },

    async findByIdForTracking(id) {
      return prisma.pet.findUnique({
        where: { id },
        select: { id: true, workspaceId: true, status: true },
      })
    },

    async trackEvent(petId, workspaceId, type) {
      await prisma.petMetricEvent.create({
        data: {
          petId,
          workspaceId,
          type: type as 'VIEW_PET' | 'CLICK_WHATSAPP' | 'REGISTER_INTEREST',
        },
      })
    },
  }
}
