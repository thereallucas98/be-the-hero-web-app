import type {
  PetRepository,
  PetWithWorkspaceItem,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RemovePetImageInput {
  petId: string
  imageId: string
}

export type RemovePetImageResult =
  | { success: true }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'CANNOT_REMOVE_LAST_IMAGE'
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

export async function removePetImage(
  petRepo: PetRepository,
  principal: Principal | null,
  input: RemovePetImageInput,
): Promise<RemovePetImageResult> {
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

  const result = await petRepo.deletePetImage(
    input.imageId,
    input.petId,
    principal.userId,
  )

  if (!result.success) {
    if (result.code === 'IMAGE_NOT_FOUND') {
      return { success: false, code: 'NOT_FOUND' }
    }
    return { success: false, code: result.code }
  }

  return { success: true }
}
