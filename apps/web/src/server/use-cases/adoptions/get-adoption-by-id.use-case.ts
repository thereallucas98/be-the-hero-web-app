import type {
  AdoptionDetailsItem,
  AdoptionForAccessItem,
  AdoptionRepository,
} from '../../repositories/adoption.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface GetAdoptionByIdInput {
  adoptionId: string
}

export type GetAdoptionByIdResult =
  | { success: true; adoption: AdoptionDetailsItem }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

function isAuthorized(
  principal: Principal,
  adoption: AdoptionForAccessItem,
): boolean {
  if (principal.userId === adoption.guardianUserId) return true
  if (principal.role === 'SUPER_ADMIN') return true

  const membership = principal.memberships.find(
    (m) => m.workspaceId === adoption.workspaceId,
  )
  if (
    membership &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  ) {
    return true
  }

  if (principal.role === 'ADMIN' && principal.adminCities.length > 0) {
    const hasCoverage = principal.adminCities.some((cid) =>
      adoption.workspaceCityIds.includes(cid),
    )
    if (hasCoverage) return true
  }

  return false
}

export async function getAdoptionById(
  adoptionRepo: AdoptionRepository,
  principal: Principal | null,
  input: GetAdoptionByIdInput,
): Promise<GetAdoptionByIdResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const adoptionForAccess = await adoptionRepo.findByIdForAccess(
    input.adoptionId,
  )
  if (!adoptionForAccess) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!isAuthorized(principal, adoptionForAccess)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const adoption = await adoptionRepo.findByIdWithDetails(input.adoptionId)
  if (!adoption) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true, adoption }
}
