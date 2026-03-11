import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RemoveCityCoverageInput {
  workspaceId: string
  coverageId: string
}

export type RemoveCityCoverageResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

function isOwner(principal: Principal, workspaceId: string): boolean {
  return principal.memberships.some(
    (m) => m.workspaceId === workspaceId && m.role === 'OWNER',
  )
}

export async function removeCityCoverage(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: RemoveCityCoverageInput,
): Promise<RemoveCityCoverageResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (!isOwner(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const removed = await workspaceRepo.removeCityCoverage(
    input.workspaceId,
    input.coverageId,
  )
  if (!removed) {
    return { success: false, code: 'NOT_FOUND' }
  }

  return { success: true }
}
