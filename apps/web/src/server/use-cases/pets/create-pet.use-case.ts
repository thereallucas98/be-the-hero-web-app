import type {
  CreatedPetItem,
  PetRepository,
} from '../../repositories/pet.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface CreatePetInput {
  workspaceId: string
  name: string
  description: string
  species: string
  sex: string
  size: string
  ageCategory: string
  energyLevel?: string
  independenceLevel?: string
  environment?: string
  adoptionRequirements?: string
}

export type CreatePetResult =
  | { success: true; pet: CreatedPetItem }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

function canCreatePet(principal: Principal, workspaceId: string): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspaceId,
  )
  return (
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  )
}

export async function createPet(
  petRepo: PetRepository,
  workspaceRepo: WorkspaceRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: CreatePetInput,
): Promise<CreatePetResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!workspace.isActive) {
    return { success: false, code: 'FORBIDDEN' }
  }

  if (!canCreatePet(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const pet = await petRepo.create({
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    species: input.species,
    sex: input.sex,
    size: input.size,
    ageCategory: input.ageCategory,
    energyLevel: input.energyLevel,
    independenceLevel: input.independenceLevel,
    environment: input.environment,
    adoptionRequirements: input.adoptionRequirements,
  })

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'CREATE',
    entityType: 'PET',
    entityId: pet.id,
    metadata: { workspaceId: input.workspaceId },
  })

  return { success: true, pet }
}
