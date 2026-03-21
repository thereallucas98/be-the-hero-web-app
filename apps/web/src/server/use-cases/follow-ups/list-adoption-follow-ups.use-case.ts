import type { AdoptionRepository } from '../../repositories/adoption.repository'
import type {
  FollowUpListItem,
  FollowUpRepository,
} from '../../repositories/follow-up.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface ListAdoptionFollowUpsInput {
  adoptionId: string
}

export type ListAdoptionFollowUpsResult =
  | { success: true; followUps: FollowUpListItem[] }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listAdoptionFollowUps(
  adoptionRepo: AdoptionRepository,
  followUpRepo: FollowUpRepository,
  principal: Principal | null,
  input: ListAdoptionFollowUpsInput,
): Promise<ListAdoptionFollowUpsResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const adoption = await adoptionRepo.findByIdForAccess(input.adoptionId)
  if (!adoption) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const isGuardian = principal.userId === adoption.guardianUserId
  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  const membership = principal.memberships.find(
    (m) => m.workspaceId === adoption.workspaceId,
  )
  const isEditorMember =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  const isAdminWithCoverage =
    principal.role === 'ADMIN' &&
    principal.adminCities.some((c) => adoption.workspaceCityIds.includes(c))

  if (!isGuardian && !isAdmin && !isEditorMember && !isAdminWithCoverage) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const followUps = await followUpRepo.findByAdoptionId(input.adoptionId)
  return { success: true, followUps }
}
