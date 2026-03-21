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

export interface UpdatePetRequirementInput {
  petId: string
  reqId: string
  category?: string
  title?: string
  description?: string
  isMandatory?: boolean
  order?: number
}

export type UpdatePetRequirementResult =
  | { success: true; requirement: PetRequirementItem }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' | 'ORDER_CONFLICT'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function updatePetRequirement(
  petRepo: PetRepository,
  principal: Principal | null,
  input: UpdatePetRequirementInput,
): Promise<UpdatePetRequirementResult> {
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

  const existing = await petRepo.findRequirementById(input.reqId, input.petId)
  if (!existing) {
    return { success: false, code: 'NOT_FOUND' }
  }

  try {
    const requirement = await petRepo.updateRequirement(
      input.reqId,
      input.petId,
      {
        category: input.category,
        title: input.title,
        description: input.description,
        isMandatory: input.isMandatory,
        order: input.order,
      },
    )
    if (!requirement) {
      return { success: false, code: 'NOT_FOUND' }
    }
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
