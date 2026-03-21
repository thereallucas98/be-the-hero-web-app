import type {
  AdminCoverageItem,
  AdminCoverageRepository,
} from '../../repositories/admin-coverage.repository'
import type { GeoPlaceRepository } from '../../repositories/geo-place.repository'
import type { UserRepository } from '../../repositories/user.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddAdminCoverageInput {
  adminUserId: string
  cityId: string
}

export type AddAdminCoverageResult =
  | { success: true; item: AdminCoverageItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'USER_NOT_FOUND'
        | 'CITY_NOT_FOUND'
        | 'ALREADY_EXISTS'
    }

export async function addAdminCoverage(
  adminCoverageRepo: AdminCoverageRepository,
  userRepo: UserRepository,
  geoPlaceRepo: GeoPlaceRepository,
  principal: Principal | null,
  input: AddAdminCoverageInput,
): Promise<AddAdminCoverageResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }
  if (principal.role !== 'SUPER_ADMIN')
    return { success: false, code: 'FORBIDDEN' }

  const targetUser = await userRepo.findByIdWithRole(input.adminUserId)
  if (!targetUser || targetUser.role !== 'ADMIN')
    return { success: false, code: 'USER_NOT_FOUND' }

  const city = await geoPlaceRepo.findCityById(input.cityId)
  if (!city || city.type !== 'CITY')
    return { success: false, code: 'CITY_NOT_FOUND' }

  const alreadyExists = await adminCoverageRepo.exists(
    input.adminUserId,
    input.cityId,
  )
  if (alreadyExists) return { success: false, code: 'ALREADY_EXISTS' }

  const item = await adminCoverageRepo.create(input.adminUserId, input.cityId)
  return { success: true, item }
}
