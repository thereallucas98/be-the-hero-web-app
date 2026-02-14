import type {
  CreatedPetImageItem,
  PetRepository,
  PetWithWorkspaceItem,
} from '../../repositories/pet.repository'
import { isValidPetImagePath } from '~/lib/storage/pet-image-path'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddPetImageInput {
  petId: string
  url: string
  storagePath: string
  position: number
  isCover: boolean
}

export type AddPetImageResult =
  | { success: true; image: CreatedPetImageItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'INVALID_STORAGE_PATH'
        | 'MAX_IMAGES_REACHED'
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

export async function addPetImage(
  petRepo: PetRepository,
  principal: Principal | null,
  input: AddPetImageInput,
): Promise<AddPetImageResult> {
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

  if (!isValidPetImagePath(input.storagePath, input.petId)) {
    return { success: false, code: 'INVALID_STORAGE_PATH' }
  }

  const result = await petRepo.addPetImage(
    input.petId,
    {
      url: input.url,
      storagePath: input.storagePath,
      position: input.position,
      isCover: input.isCover,
    },
    principal.userId,
  )

  if (!result.success) {
    if (result.code === 'PET_NOT_FOUND') {
      return { success: false, code: 'NOT_FOUND' }
    }
    return { success: false, code: result.code }
  }

  return { success: true, image: result.image }
}
