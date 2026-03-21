import type {
  DonationItem,
  DonationRepository,
} from '../../repositories/donation.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RejectDonationInput {
  donationId: string
  reviewNote: string
}

export type RejectDonationResult =
  | { success: true; donation: DonationItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'DONATION_NOT_REVIEWABLE'
    }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function rejectDonation(
  donationRepo: DonationRepository,
  principal: Principal | null,
  input: RejectDonationInput,
): Promise<RejectDonationResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await donationRepo.findById(input.donationId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.status !== 'PENDING_REVIEW') {
    return { success: false, code: 'DONATION_NOT_REVIEWABLE' }
  }

  const donation = await donationRepo.reject(
    input.donationId,
    principal.userId,
    input.reviewNote,
  )
  return { success: true, donation }
}
