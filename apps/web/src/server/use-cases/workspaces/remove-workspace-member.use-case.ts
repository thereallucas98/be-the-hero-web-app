import type { WorkspaceRepository } from '../../repositories/workspace.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RemoveWorkspaceMemberInput {
  workspaceId: string
  memberId: string
}

export type RemoveWorkspaceMemberResult =
  | { success: true }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'CANNOT_REMOVE_LAST_OWNER'
    }

function isOwner(principal: Principal, workspaceId: string): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspaceId,
  )
  return membership?.role === 'OWNER'
}

export async function removeWorkspaceMember(
  workspaceRepo: WorkspaceRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: RemoveWorkspaceMemberInput,
): Promise<RemoveWorkspaceMemberResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!isOwner(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const member = await workspaceRepo.findMemberInWorkspace(
    input.workspaceId,
    input.memberId,
  )
  if (!member) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (member.userId === principal.userId && member.role === 'OWNER') {
    const ownerCount = await workspaceRepo.countActiveOwners(input.workspaceId)
    if (ownerCount <= 1) {
      return { success: false, code: 'CANNOT_REMOVE_LAST_OWNER' }
    }
  }

  const deactivated = await workspaceRepo.deactivateMember(
    input.workspaceId,
    input.memberId,
  )
  if (!deactivated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'UPDATE',
    entityType: 'PARTNER_WORKSPACE',
    entityId: input.workspaceId,
    metadata: {
      removedMember: true,
      memberId: input.memberId,
      memberUserId: member.userId,
    },
  })

  return { success: true }
}
