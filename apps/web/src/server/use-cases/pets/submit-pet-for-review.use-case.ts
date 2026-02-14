import type {
  CreatedPetItem,
  PetRepository,
  PetWithImagesAndWorkspaceItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface SubmitPetForReviewInput {
  petId: string
}

export type SubmitPetForReviewResult =
  | { success: true; pet: CreatedPetItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'INVALID_STATUS'
        | 'INVALID_DATA'
        | 'INVALID_IMAGES'
        | 'WORKSPACE_BLOCKED'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const
const MIN_IMAGES = 1
const MAX_IMAGES = 5

function canEditPet(
  principal: Principal,
  pet: PetWithImagesAndWorkspaceItem,
): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === pet.workspaceId,
  )
  return (
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  )
}

function hasMinimumData(pet: PetWithImagesAndWorkspaceItem): boolean {
  return !!(
    pet.name?.trim() &&
    pet.description?.trim() &&
    pet.species &&
    pet.sex &&
    pet.size &&
    pet.ageCategory
  )
}

function validateImages(pet: PetWithImagesAndWorkspaceItem): boolean {
  const images = pet.images ?? []
  if (images.length < MIN_IMAGES || images.length > MAX_IMAGES) {
    return false
  }
  const coverCount = images.filter((img) => img.isCover).length
  if (coverCount !== 1) {
    return false
  }
  const positions = new Set(images.map((img) => img.position))
  if (positions.size !== images.length) {
    return false
  }
  const hasValidPositions = images.every(
    (img) => Number.isInteger(img.position) && img.position >= 0,
  )
  return hasValidPositions
}

export async function submitPetForReview(
  petRepo: PetRepository,
  principal: Principal | null,
  input: SubmitPetForReviewInput,
): Promise<SubmitPetForReviewResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdWithImagesAndWorkspace(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!canEditPet(principal, pet)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  if (pet.status !== 'DRAFT') {
    return { success: false, code: 'INVALID_STATUS' }
  }

  if (
    !pet.workspace.isActive ||
    pet.workspace.verificationStatus === 'REJECTED'
  ) {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  if (!hasMinimumData(pet)) {
    return { success: false, code: 'INVALID_DATA' }
  }

  if (!validateImages(pet)) {
    return { success: false, code: 'INVALID_IMAGES' }
  }

  const updated = await petRepo.submitForReview(input.petId, principal.userId)
  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, pet: updated }
}
