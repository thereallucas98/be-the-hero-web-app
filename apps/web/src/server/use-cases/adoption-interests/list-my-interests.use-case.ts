import type {
  AdoptionInterestRepository,
  MyInterestListItem,
} from '../../repositories/adoption-interest.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface ListMyInterestsInput {
  page?: number
  perPage?: number
}

export type ListMyInterestsResult =
  | {
      success: true
      items: MyInterestListItem[]
      total: number
      page: number
      perPage: number
    }
  | { success: false; code: 'UNAUTHENTICATED' }

export async function listMyInterests(
  adoptionInterestRepo: AdoptionInterestRepository,
  principal: Principal | null,
  input: ListMyInterestsInput,
): Promise<ListMyInterestsResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const page = Math.max(1, input.page ?? 1)
  const perPage = Math.min(20, Math.max(1, input.perPage ?? 10))

  const result = await adoptionInterestRepo.findByUserId(principal.userId, {
    page,
    perPage,
  })

  return {
    success: true,
    items: result.items,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
  }
}
