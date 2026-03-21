import type {
  WorkspaceAdminItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type ApproveWorkspaceResult =
  | { success: true; workspace: WorkspaceAdminItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'WORKSPACE_NOT_REVIEWABLE'
    }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function approveWorkspace(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  workspaceId: string,
): Promise<ApproveWorkspaceResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await workspaceRepo.findByIdSimple(workspaceId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.verificationStatus !== 'PENDING') {
    return { success: false, code: 'WORKSPACE_NOT_REVIEWABLE' }
  }

  const workspace = await workspaceRepo.approveWorkspace(
    workspaceId,
    principal.userId,
  )
  return { success: true, workspace }
}
