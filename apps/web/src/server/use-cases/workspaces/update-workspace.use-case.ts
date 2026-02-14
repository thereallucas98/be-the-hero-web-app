import type {
  UpdateWorkspaceBasicData,
  WorkspaceDetailsItem,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'
import type { AuditRepository } from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface UpdateWorkspaceInput {
  id: string
  data: UpdateWorkspaceBasicData
}

export type UpdateWorkspaceResult =
  | { success: true; workspace: WorkspaceDetailsItem }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

function canEdit(
  principal: Principal,
  workspace: WorkspaceDetailsItem,
): boolean {
  if (principal.role === 'SUPER_ADMIN') return true

  const membership = principal.memberships.find(
    (m) => m.workspaceId === workspace.id,
  )
  if (
    membership &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')
  )
    return true

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

export async function updateWorkspace(
  workspaceRepo: WorkspaceRepository,
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: UpdateWorkspaceInput,
): Promise<UpdateWorkspaceResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const existing = await workspaceRepo.findByIdWithDetails(input.id)
  if (!existing) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (!canEdit(principal, existing)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const hasChanges = Object.keys(input.data).length > 0
  if (!hasChanges) {
    return { success: true, workspace: existing }
  }

  const updated = await workspaceRepo.updateBasicData(input.id, input.data)
  if (!updated) {
    return { success: false, code: 'NOT_FOUND' }
  }

  await auditRepo.createLog({
    actorUserId: principal.userId,
    action: 'UPDATE',
    entityType: 'PARTNER_WORKSPACE',
    entityId: input.id,
    metadata: { updatedFields: Object.keys(input.data) },
  })

  return { success: true, workspace: updated }
}
