import type { WorkspaceRepository } from '../../repositories/workspace.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface UpdateWorkspaceMemberRoleInput {
  workspaceId: string
  memberId: string
  role: 'OWNER' | 'EDITOR' | 'FINANCIAL'
}

export type UpdateWorkspaceMemberRoleResult =
  | {
      success: true
      member: {
        id: string
        role: string
        user: { id: string; fullName: string }
      }
    }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'CANNOT_DEMOTE_LAST_OWNER'
    }

function isOwner(principal: Principal, workspaceId: string): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspaceId,
  )
  return membership?.role === 'OWNER'
}

export async function updateWorkspaceMemberRole(
  workspaceRepo: WorkspaceRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: UpdateWorkspaceMemberRoleInput,
): Promise<UpdateWorkspaceMemberRoleResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
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

  if (member.role === 'OWNER' && input.role !== 'OWNER') {
    const ownerCount = await workspaceRepo.countActiveOwners(input.workspaceId)
    if (ownerCount <= 1) {
      return { success: false, code: 'CANNOT_DEMOTE_LAST_OWNER' }
    }
  }

  const updated = await workspaceRepo.updateMemberRole(
    input.workspaceId,
    input.memberId,
    input.role,
  )
  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'UPDATE',
    entityType: 'PARTNER_WORKSPACE',
    entityId: input.workspaceId,
    metadata: {
      updatedMemberRole: true,
      memberId: input.memberId,
      memberUserId: member.userId,
      newRole: input.role,
    },
  })

  return { success: true, member: updated }
}
