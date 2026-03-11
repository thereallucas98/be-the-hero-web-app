import type { AuditRepository } from '../../repositories/audit.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface DeactivateWorkspaceInput {
  workspaceId: string
}

export type DeactivateWorkspaceResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

function canDeactivate(principal: Principal, workspaceId: string): boolean {
  if (principal.role === 'SUPER_ADMIN' || principal.role === 'ADMIN')
    return true
  return principal.memberships.some(
    (m) => m.workspaceId === workspaceId && m.role === 'OWNER',
  )
}

export async function deactivateWorkspace(
  workspaceRepo: WorkspaceRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: DeactivateWorkspaceInput,
): Promise<DeactivateWorkspaceResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (!canDeactivate(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const deactivated = await workspaceRepo.deactivateWorkspace(input.workspaceId)
  if (!deactivated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'DELETE',
    entityType: 'PARTNER_WORKSPACE',
    entityId: input.workspaceId,
    metadata: { deactivated: true },
  })

  return { success: true }
}
