import type {
  PetRepository,
  PetWithImagesAndWorkspaceForAdminItem,
  RejectedPetItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  adminCities: string[]
}

export interface RejectPetAdminInput {
  petId: string
  reviewNote: string
}

export type RejectPetAdminResult =
  | { success: true; pet: RejectedPetItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'INVALID_STATUS'
        | 'WORKSPACE_BLOCKED'
        | 'MISSING_REVIEW_NOTE'
    }

function canRejectPet(
  principal: Principal,
  pet: PetWithImagesAndWorkspaceForAdminItem,
): boolean {
  if (principal.role === 'SUPER_ADMIN') return true

  if (principal.role === 'ADMIN' && principal.adminCities.length > 0) {
    const hasCoverage = principal.adminCities.some((cid) =>
      pet.workspace.workspaceCityIds.includes(cid),
    )
    if (hasCoverage) return true
  }

  return false
}

export async function rejectPetAdmin(
  petRepo: PetRepository,
  principal: Principal | null,
  input: RejectPetAdminInput,
): Promise<RejectPetAdminResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdWithImagesAndWorkspaceForAdmin(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!canRejectPet(principal, pet)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  if (pet.status !== 'PENDING_REVIEW') {
    return { success: false, code: 'INVALID_STATUS' }
  }

  if (
    !pet.workspace.isActive ||
    pet.workspace.verificationStatus === 'REJECTED'
  ) {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  const reviewNote = input.reviewNote?.trim() ?? ''
  if (reviewNote.length === 0) {
    return { success: false, code: 'MISSING_REVIEW_NOTE' }
  }

  const updated = await petRepo.rejectPet(
    input.petId,
    principal.userId,
    reviewNote,
  )
  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, pet: updated }
}
