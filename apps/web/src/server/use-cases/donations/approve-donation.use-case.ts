import type {
  DonationItem,
  DonationRepository,
} from '../../repositories/donation.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type ApproveDonationResult =
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

export async function approveDonation(
  donationRepo: DonationRepository,
  principal: Principal | null,
  donationId: string,
): Promise<ApproveDonationResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await donationRepo.findById(donationId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.status !== 'PENDING_REVIEW') {
    return { success: false, code: 'DONATION_NOT_REVIEWABLE' }
  }

  const donation = await donationRepo.approve(donationId, principal.userId)
  return { success: true, donation }
}
