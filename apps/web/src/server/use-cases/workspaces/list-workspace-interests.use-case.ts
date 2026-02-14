import type {
  AdoptionInterestRepository,
  ListByWorkspaceResult,
} from '../../repositories/adoption-interest.repository'
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

export interface ListWorkspaceInterestsInput {
  workspaceId: string
  page?: number
  perPage?: number
}

export type ListWorkspaceInterestsResult =
  | { success: true; data: ListByWorkspaceResult }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN'
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

export async function listWorkspaceInterests(
  workspaceRepo: WorkspaceRepository,
  adoptionInterestRepo: AdoptionInterestRepository,
  principal: Principal | null,
  input: ListWorkspaceInterestsInput,
): Promise<ListWorkspaceInterestsResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const workspace = await workspaceRepo.findByIdForInterestsAccess(
    input.workspaceId,
  )
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!isAuthorized(principal, workspace)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const page = Math.max(1, input.page ?? 1)
  const perPage = Math.min(20, Math.max(1, input.perPage ?? 20))

  const data = await adoptionInterestRepo.listByWorkspace({
    workspaceId: input.workspaceId,
    page,
    perPage,
  })

  return { success: true, data }
}
