import type {
  MetricsRepository,
  WorkspaceMetricsData,
} from '../../repositories/metrics.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export type GetWorkspaceMetricsResult =
  | { success: true; metrics: WorkspaceMetricsData }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function getWorkspaceMetrics(
  workspaceRepo: WorkspaceRepository,
  metricsRepo: MetricsRepository,
  principal: Principal | null,
  workspaceId: string,
): Promise<GetWorkspaceMetricsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const workspace = await workspaceRepo.findByIdSimple(workspaceId)
  if (!workspace) return { success: false, code: 'NOT_FOUND' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  const isMember = principal.memberships.some(
    (m) => m.workspaceId === workspaceId,
  )

  if (!isAdmin && !isMember) return { success: false, code: 'FORBIDDEN' }

  const metrics = await metricsRepo.getWorkspaceMetrics(workspaceId)
  return { success: true, metrics }
}
