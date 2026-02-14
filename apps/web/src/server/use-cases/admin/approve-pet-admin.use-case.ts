import type {
  ApprovedPetItem,
  PetRepository,
  PetWithImagesAndWorkspaceForAdminItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  adminCities: string[]
}

export interface ApprovePetAdminInput {
  petId: string
}

export type ApprovePetAdminResult =
  | { success: true; pet: ApprovedPetItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'INVALID_STATUS'
        | 'INVALID_IMAGES'
        | 'WORKSPACE_BLOCKED'
    }

const MIN_IMAGES = 1
const MAX_IMAGES = 5

function canApprovePet(
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

function validateImages(pet: PetWithImagesAndWorkspaceForAdminItem): boolean {
  const images = pet.images ?? []
  if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
    return false
  }
  const coverCount = images.filter((img) => img.isCover).length
  return coverCount === 1
}

export async function approvePetAdmin(
  petRepo: PetRepository,
  principal: Principal | null,
  input: ApprovePetAdminInput,
): Promise<ApprovePetAdminResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdWithImagesAndWorkspaceForAdmin(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!canApprovePet(principal, pet)) {
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

  if (!validateImages(pet)) {
    return { success: false, code: 'INVALID_IMAGES' }
  }

  const updated = await petRepo.approvePet(input.petId, principal.userId)
  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, pet: updated }
}
