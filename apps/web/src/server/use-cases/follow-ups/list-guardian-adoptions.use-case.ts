import type {
  FollowUpRepository,
  GuardianAdoptionListItem,
  ListGuardianAdoptionsResult,
} from '../../repositories/follow-up.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface ListGuardianAdoptionsInput {
  page?: number
  perPage?: number
}

export type ListGuardianAdoptionsUseCaseResult =
  | {
      success: true
      items: GuardianAdoptionListItem[]
      total: number
      page: number
      perPage: number
    }
  | { success: false; code: 'UNAUTHENTICATED' }

export async function listGuardianAdoptions(
  followUpRepo: FollowUpRepository,
  principal: Principal | null,
  input: ListGuardianAdoptionsInput,
): Promise<ListGuardianAdoptionsUseCaseResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const result: ListGuardianAdoptionsResult =
    await followUpRepo.findAdoptionsByGuardian(principal.userId, {
      page: input.page,
      perPage: input.perPage,
    })

  return {
    success: true,
    items: result.items,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
  }
}
