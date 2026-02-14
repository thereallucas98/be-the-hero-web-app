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

export interface PetRepository {
  create(data: CreatePetData): Promise<CreatedPetItem>
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
  }
}
