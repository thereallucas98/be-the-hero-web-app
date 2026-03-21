import type { AdoptionInterestRepository } from '../../repositories/adoption-interest.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface WithdrawAdoptionInterestInput {
  interestId: string
}

export type WithdrawAdoptionInterestResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

export async function withdrawAdoptionInterest(
  adoptionInterestRepo: AdoptionInterestRepository,
  principal: Principal | null,
  input: WithdrawAdoptionInterestInput,
): Promise<WithdrawAdoptionInterestResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const interest = await adoptionInterestRepo.findById(input.interestId)
  if (!interest) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (interest.userId !== principal.userId) {
    return { success: false, code: 'FORBIDDEN' }
  }

  await adoptionInterestRepo.deleteById(input.interestId)

  return { success: true }
}
