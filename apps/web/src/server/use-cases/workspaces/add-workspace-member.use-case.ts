import type { UserRepository } from '../../repositories/user.repository'
import type {
  CreatedWorkspaceMemberItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddWorkspaceMemberInput {
  workspaceId: string
  email: string
  role: 'OWNER' | 'EDITOR' | 'FINANCIAL'
}

export type AddWorkspaceMemberResult =
  | { success: true; member: CreatedWorkspaceMemberItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'USER_NOT_FOUND'
        | 'ALREADY_MEMBER'
    }

function isOwner(principal: Principal, workspaceId: string): boolean {
  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspaceId,
  )
  return membership?.role === 'OWNER'
}

export async function addWorkspaceMember(
  workspaceRepo: WorkspaceRepository,
  userRepo: UserRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: AddWorkspaceMemberInput,
): Promise<AddWorkspaceMemberResult> {
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

  const user = await userRepo.findByEmail(input.email)
  if (!user) {
    return { success: false, code: 'USER_NOT_FOUND' }
  }

  const result = await workspaceRepo.addMember(
    input.workspaceId,
    user.id,
    input.role,
  )

  if (!result.success) {
    if (result.code === 'WORKSPACE_NOT_FOUND') {
      return { success: false, code: 'NOT_FOUND' }
    }
    if (result.code === 'USER_NOT_FOUND') {
      return { success: false, code: 'USER_NOT_FOUND' }
    }
    return { success: false, code: 'ALREADY_MEMBER' }
  }

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'CREATE',
    entityType: 'PARTNER_WORKSPACE',
    entityId: input.workspaceId,
    metadata: {
      addedMember: true,
      memberUserId: user.id,
      memberRole: input.role,
    },
  })

  return { success: true, member: result.member }
}
