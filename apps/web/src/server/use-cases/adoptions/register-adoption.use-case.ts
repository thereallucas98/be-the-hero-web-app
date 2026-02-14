import type {
  AdoptionRepository,
  CreatedAdoptionItem,
} from '../../repositories/adoption.repository'
import type { PetRepository } from '../../repositories/pet.repository'
import type { UserRepository } from '../../repositories/user.repository'
import type {
  WorkspaceForInterestsAccessItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface RegisterAdoptionInput {
  petId: string
  guardianUserId: string
  adoptedAt?: Date
  notes?: string | null
}

export type RegisterAdoptionResult =
  | { success: true; adoption: CreatedAdoptionItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'PET_NOT_APPROVED'
        | 'PET_ALREADY_ADOPTED'
        | 'WORKSPACE_BLOCKED'
        | 'GUARDIAN_NOT_FOUND'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

function isAuthorized(
  principal: Principal,
  workspace: WorkspaceForInterestsAccessItem,
): boolean {
  if (principal.role === 'SUPER_ADMIN') return true

  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspace.id,
  )
  if (
    membership &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  ) {
    return true
  }

  if (principal.role === 'ADMIN' && principal.adminCities.length > 0) {
    const hasCoverage = principal.adminCities.some((cid) =>
      workspace.workspaceCityIds.includes(cid),
    )
    if (hasCoverage) return true
  }

  return false
}

export async function registerAdoption(
  petRepo: PetRepository,
  userRepo: UserRepository,
  workspaceRepo: WorkspaceRepository,
  adoptionRepo: AdoptionRepository,
  principal: Principal | null,
  input: RegisterAdoptionInput,
): Promise<RegisterAdoptionResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const pet = await petRepo.findByIdForAdoption(input.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (pet.hasAdoption) {
    return { success: false, code: 'PET_ALREADY_ADOPTED' }
  }

  if (pet.status !== 'APPROVED') {
    return { success: false, code: 'PET_NOT_APPROVED' }
  }

  if (
    !pet.workspace.isActive ||
    pet.workspace.verificationStatus !== 'APPROVED'
  ) {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  const workspace = await workspaceRepo.findByIdForInterestsAccess(
    pet.workspaceId,
  )
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!isAuthorized(principal, workspace)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const guardian = await userRepo.findByIdWithRole(input.guardianUserId)
  if (!guardian || guardian.role !== 'GUARDIAN') {
    return { success: false, code: 'GUARDIAN_NOT_FOUND' }
  }

  const adoptedAt = input.adoptedAt ?? new Date()

  const adoption = await adoptionRepo.create({
    petId: input.petId,
    guardianUserId: input.guardianUserId,
    workspaceId: pet.workspaceId,
    adoptedAt,
    notes: input.notes ?? null,
    createdByUserId: principal.userId,
  })

  return { success: true, adoption }
}
