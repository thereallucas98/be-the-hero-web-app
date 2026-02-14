import type {
  AdoptionInterestRepository,
  CreatedAdoptionInterestItem,
} from '../../repositories/adoption-interest.repository'
import type { PetRepository } from '../../repositories/pet.repository'

export interface RegisterAdoptionInterestInput {
  petId: string
  message?: string | null
}

export type RegisterAdoptionInterestResult =
  | { success: true; interest: CreatedAdoptionInterestItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'PET_NOT_APPROVED'
        | 'PET_INACTIVE'
        | 'WORKSPACE_BLOCKED'
        | 'PET_ALREADY_ADOPTED'
    }

export async function registerAdoptionInterest(
  petRepo: PetRepository,
  adoptionInterestRepo: AdoptionInterestRepository,
  principal: { userId: string; role: string } | null,
  input: RegisterAdoptionInterestInput,
): Promise<RegisterAdoptionInterestResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (principal.role !== 'GUARDIAN') {
    return { success: false, code: 'FORBIDDEN' }
  }

  const pet = await petRepo.findByIdForInterest(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (pet.status !== 'APPROVED') {
    if (pet.status === 'ADOPTED') {
      return { success: false, code: 'PET_ALREADY_ADOPTED' }
    }
    return { success: false, code: 'PET_NOT_APPROVED' }
  }

  if (!pet.isActive) {
    return { success: false, code: 'PET_INACTIVE' }
  }

  if (
    !pet.workspace.isActive ||
    pet.workspace.verificationStatus !== 'APPROVED'
  ) {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  const interest = await adoptionInterestRepo.create(
    {
      petId: input.petId,
      userId: principal.userId,
      workspaceId: pet.workspaceId,
      message: input.message ?? null,
    },
    principal.userId,
  )

  return { success: true, interest }
}
