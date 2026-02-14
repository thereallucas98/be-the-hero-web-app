import type {
  CreatedPetItem,
  PetRepository,
  PetWithWorkspaceItem,
} from '../../repositories/pet.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface UpdatePetInput {
  petId: string
  data: {
    name?: string
    description?: string
    species?: string
    sex?: string
    size?: string
    ageCategory?: string
    energyLevel?: string
    independenceLevel?: string
    environment?: string
    adoptionRequirements?: string
  }
}

export type UpdatePetResult =
  | { success: true; pet: CreatedPetItem }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

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

export async function updatePet(
  petRepo: PetRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: UpdatePetInput,
): Promise<UpdatePetResult> {
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

  if (pet.status === 'ADOPTED') {
    return { success: false, code: 'FORBIDDEN' }
  }

  const hasChanges = Object.keys(input.data).length > 0
  const updated = hasChanges
    ? await petRepo.update(input.petId, input.data)
    : await petRepo.findByIdWithWorkspace(input.petId)

  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const resultPet: CreatedPetItem = {
    id: updated.id,
    name: updated.name,
    description: updated.description,
    species: updated.species,
    sex: updated.sex,
    size: updated.size,
    ageCategory: updated.ageCategory,
    energyLevel: updated.energyLevel,
    independenceLevel: updated.independenceLevel,
    environment: updated.environment,
    adoptionRequirements: updated.adoptionRequirements,
    status: updated.status,
    workspaceId: updated.workspaceId,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  }

  if (hasChanges) {
    await auditRepo.createLog({
      actorUserId: principal.userId,
      action: 'UPDATE',
      entityType: 'PET',
      entityId: input.petId,
      metadata: { updatedFields: Object.keys(input.data) },
    })
  }

  return { success: true, pet: resultPet }
}
