import type { PetRepository } from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RemovePetRequirementInput {
  petId: string
  reqId: string
}

export type RemovePetRequirementResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function removePetRequirement(
  petRepo: PetRepository,
  principal: Principal | null,
  input: RemovePetRequirementInput,
): Promise<RemovePetRequirementResult> {
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

  const removed = await petRepo.removeRequirement(input.reqId, input.petId)
  if (!removed) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true }
}
