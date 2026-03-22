import type {
  MetricsRepository,
  PlatformMetricsData,
  PlatformMetricsInput,
} from '../../repositories/metrics.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export type GetPlatformMetricsResult =
  | { success: true; metrics: PlatformMetricsData }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function getPlatformMetrics(
  metricsRepo: MetricsRepository,
  principal: Principal | null,
  input: PlatformMetricsInput,
): Promise<GetPlatformMetricsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const metrics = await metricsRepo.getPlatformMetrics(input)
  return { success: true, metrics }
}
