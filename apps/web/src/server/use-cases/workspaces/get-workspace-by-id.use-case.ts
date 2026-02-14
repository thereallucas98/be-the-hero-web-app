import type {
  WorkspaceDetailsItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface GetWorkspaceByIdInput {
  id: string
  membersPage?: number
  membersPerPage?: number
}

export type GetWorkspaceByIdResult =
  | { success: true; workspace: WorkspaceDetailsItem }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

function isAuthorized(
  principal: Principal,
  workspace: WorkspaceDetailsItem,
): boolean {
  if (principal.role === 'SUPER_ADMIN') return true

  const isMember = principal.memberships.some(
    (m) => m.workspaceId === workspace.id,
  )
  if (isMember) return true

  if (principal.role === 'ADMIN' && principal.adminCities.length > 0) {
    const workspaceCityIds = new Set<string>()
    if (workspace.primaryLocation?.cityPlace?.id) {
      workspaceCityIds.add(workspace.primaryLocation.cityPlace.id)
    }
    workspace.cityCoverage.forEach((c) => workspaceCityIds.add(c.id))
    const hasCoverage = principal.adminCities.some((cid) =>
      workspaceCityIds.has(cid),
    )
    if (hasCoverage) return true
  }

  return false
}

export async function getWorkspaceById(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: GetWorkspaceByIdInput,
): Promise<GetWorkspaceByIdResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.id, {
    membersPage: input.membersPage ?? 1,
    membersPerPage: input.membersPerPage ?? 20,
  })

  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!isAuthorized(principal, workspace)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  return { success: true, workspace }
}
