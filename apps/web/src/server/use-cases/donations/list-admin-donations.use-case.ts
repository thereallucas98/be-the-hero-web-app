import type {
  DonationRepository,
  ListDonationsResult,
} from '../../repositories/donation.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListAdminDonationsInput {
  campaignId?: string
  workspaceId?: string
  userId?: string
  status?: string
  page: number
  perPage: number
}

export type ListAdminDonationsResult =
  | { success: true; data: ListDonationsResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listAdminDonations(
  donationRepo: DonationRepository,
  principal: Principal | null,
  input: ListAdminDonationsInput,
): Promise<ListAdminDonationsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const data = await donationRepo.listForAdmin(input)
  return { success: true, data }
}
