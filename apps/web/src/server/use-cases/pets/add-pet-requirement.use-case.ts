import { Prisma } from '~/generated/prisma/client'
import type {
  PetRepository,
  PetRequirementItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddPetRequirementInput {
  petId: string
  category: string
  title: string
  description?: string
  isMandatory?: boolean
  order: number
}

export type AddPetRequirementResult =
  | { success: true; requirement: PetRequirementItem }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' | 'ORDER_CONFLICT'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function addPetRequirement(
  petRepo: PetRepository,
  principal: Principal | null,
  input: AddPetRequirementInput,
): Promise<AddPetRequirementResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdWithWorkspace(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const membership = principal.memberships.find(
    (m) => m.workspaceId === pet.workspaceId,
  )
  const canEdit =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')

  if (!canEdit) {
    return { success: false, code: 'FORBIDDEN' }
  }

  try {
    const requirement = await petRepo.addRequirement(input.petId, {
      category: input.category,
      title: input.title,
      description: input.description,
      isMandatory: input.isMandatory,
      order: input.order,
    })
    return { success: true, requirement }
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return { success: false, code: 'ORDER_CONFLICT' }
    }
    throw e
  }
}
