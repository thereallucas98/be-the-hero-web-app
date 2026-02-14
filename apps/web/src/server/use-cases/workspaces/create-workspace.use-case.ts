import type { GeoPlaceRepository } from '../../repositories/geo-place.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface CreateWorkspaceInput {
  name: string
  type: string
  description: string
  phone?: string
  whatsapp?: string
  emailPublic?: string
  cityPlaceId: string
  lat: number
  lng: number
  addressLine?: string
  neighborhood?: string
  zipCode?: string
}

export interface Principal {
  userId: string
  role: string
}

export type CreateWorkspaceResult =
  | {
      success: true
      workspace: { id: string; name: string; verificationStatus: string }
    }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'INVALID_CITY' }

export async function createWorkspace(
  workspaceRepo: WorkspaceRepository,
  geoPlaceRepo: GeoPlaceRepository,
  principal: Principal | null,
  input: CreateWorkspaceInput,
): Promise<CreateWorkspaceResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (principal.role !== 'PARTNER_MEMBER') {
    return { success: false, code: 'FORBIDDEN' }
  }

  const city = await geoPlaceRepo.findCityById(input.cityPlaceId)
  if (!city || city.type !== 'CITY') {
    return { success: false, code: 'INVALID_CITY' }
  }

  const workspace = await workspaceRepo.createWithLocationAndMember(
    input,
    principal.userId,
  )

  return {
    success: true,
    workspace,
  }
}
