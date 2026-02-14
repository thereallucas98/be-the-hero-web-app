import type {
  CreatedPetImageItem,
  PetRepository,
  PetWithWorkspaceItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface UpdatePetImageInput {
  petId: string
  imageId: string
  data: { position?: number; isCover?: boolean }
}

export type UpdatePetImageResult =
  | { success: true; image: CreatedPetImageItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'POSITION_ALREADY_TAKEN'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

function canEditPet(principal: Principal, pet: PetWithWorkspaceItem): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === pet.workspaceId,
  )
  return (
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  )
}

export async function updatePetImage(
  petRepo: PetRepository,
  principal: Principal | null,
  input: UpdatePetImageInput,
): Promise<UpdatePetImageResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdWithWorkspace(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!canEditPet(principal, pet)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const imageExists = await petRepo.findImageByIdAndPetId(
    input.imageId,
    input.petId,
  )
  if (!imageExists) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const result = await petRepo.updatePetImage(
    input.imageId,
    input.petId,
    input.data,
    principal.userId,
  )

  if (!result.success) {
    if (result.code === 'IMAGE_NOT_FOUND') {
      return { success: false, code: 'NOT_FOUND' }
    }
    return { success: false, code: 'POSITION_ALREADY_TAKEN' }
  }

  return { success: true, image: result.image }
}
