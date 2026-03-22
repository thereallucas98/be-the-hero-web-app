import type {
  MetricsRepository,
  PetMetricsData,
} from '../../repositories/metrics.repository'
import type { PetRepository } from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export type GetPetMetricsResult =
  | { success: true; metrics: PetMetricsData }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function getPetMetrics(
  petRepo: PetRepository,
  metricsRepo: MetricsRepository,
  principal: Principal | null,
  petId: string,
): Promise<GetPetMetricsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const pet = await petRepo.findByIdWithWorkspace(petId)
  if (!pet) return { success: false, code: 'NOT_FOUND' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  const isMember = principal.memberships.some(
    (m) => m.workspaceId === pet.workspaceId,
  )

  if (!isAdmin && !isMember) return { success: false, code: 'FORBIDDEN' }

  const metrics = await metricsRepo.getPetMetrics(petId)
  if (!metrics) return { success: false, code: 'NOT_FOUND' }

  return { success: true, metrics }
}
