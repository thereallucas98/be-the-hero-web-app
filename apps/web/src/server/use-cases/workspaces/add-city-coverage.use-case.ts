import type { GeoPlaceRepository } from '../../repositories/geo-place.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddCityCoverageInput {
  workspaceId: string
  cityPlaceId: string
}

export type AddCityCoverageResult =
  | {
      success: true
      item: {
        id: string
        cityPlace: { id: string; name: string; slug: string; type: string }
      }
    }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'NOT_FOUND'
        | 'FORBIDDEN'
        | 'INVALID_CITY'
        | 'ALREADY_COVERED'
    }

function isOwner(principal: Principal, workspaceId: string): boolean {
  return principal.memberships.some(
    (m) => m.workspaceId === workspaceId && m.role === 'OWNER',
  )
}

export async function addCityCoverage(
  workspaceRepo: WorkspaceRepository,
  geoPlaceRepo: GeoPlaceRepository,
  principal: Principal | null,
  input: AddCityCoverageInput,
): Promise<AddCityCoverageResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (!isOwner(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const city = await geoPlaceRepo.findCityById(input.cityPlaceId)
  if (!city || city.type !== 'CITY') {
    return { success: false, code: 'INVALID_CITY' }
  }

  try {
    const item = await workspaceRepo.addCityCoverage(
      input.workspaceId,
      input.cityPlaceId,
    )
    return { success: true, item }
  } catch (e: unknown) {
    if (
      e &&
      typeof e === 'object' &&
      'code' in e &&
      (e as { code: string }).code === 'P2002'
    ) {
      return { success: false, code: 'ALREADY_COVERED' }
    }
    throw e
  }
}
