import type {
  WorkspaceAdminItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RejectWorkspaceInput {
  workspaceId: string
  reviewNote: string
}

export type RejectWorkspaceResult =
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

export async function rejectWorkspace(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: RejectWorkspaceInput,
): Promise<RejectWorkspaceResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await workspaceRepo.findByIdSimple(input.workspaceId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.verificationStatus !== 'PENDING') {
    return { success: false, code: 'WORKSPACE_NOT_REVIEWABLE' }
  }

  const workspace = await workspaceRepo.rejectWorkspace(
    input.workspaceId,
    input.reviewNote,
  )
  return { success: true, workspace }
}
