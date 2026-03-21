import type { AdminCoverageRepository } from '../../repositories/admin-coverage.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type RemoveAdminCoverageResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' }

export async function removeAdminCoverage(
  adminCoverageRepo: AdminCoverageRepository,
  principal: Principal | null,
  coverageId: string,
): Promise<RemoveAdminCoverageResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }
  if (principal.role !== 'SUPER_ADMIN')
    return { success: false, code: 'FORBIDDEN' }

  const existing = await adminCoverageRepo.findById(coverageId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  await adminCoverageRepo.delete(coverageId)
  return { success: true }
}
