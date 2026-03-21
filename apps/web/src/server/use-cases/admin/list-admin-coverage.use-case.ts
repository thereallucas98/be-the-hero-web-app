import type {
  AdminCoverageItem,
  AdminCoverageRepository,
} from '../../repositories/admin-coverage.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type ListAdminCoverageResult =
  | { success: true; items: AdminCoverageItem[] }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ALLOWED_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listAdminCoverage(
  adminCoverageRepo: AdminCoverageRepository,
  principal: Principal | null,
  adminUserId?: string,
): Promise<ListAdminCoverageResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAllowed = ALLOWED_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAllowed) return { success: false, code: 'FORBIDDEN' }

  // ADMIN sees only their own coverage; SUPER_ADMIN can filter by adminUserId
  const targetUserId =
    principal.role === 'SUPER_ADMIN'
      ? (adminUserId ?? principal.userId)
      : principal.userId

  const items = await adminCoverageRepo.listByAdmin(targetUserId)
  return { success: true, items }
}
