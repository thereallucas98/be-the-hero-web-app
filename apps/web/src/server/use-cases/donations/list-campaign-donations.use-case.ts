import type { CampaignRepository } from '../../repositories/campaign.repository'
import type {
  DonationRepository,
  ListDonationsResult,
} from '../../repositories/donation.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListCampaignDonationsInput {
  campaignId: string
  status?: string
  page: number
  perPage: number
}

export type ListCampaignDonationsResult =
  | { success: true; data: ListDonationsResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' }

const WORKSPACE_READER_ROLES = [
  'OWNER',
  'EDITOR',
  'FINANCIAL',
  'ADMIN',
] as const
const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listCampaignDonations(
  campaignRepo: CampaignRepository,
  donationRepo: DonationRepository,
  principal: Principal | null,
  input: ListCampaignDonationsInput,
): Promise<ListCampaignDonationsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const campaign = await campaignRepo.findById(input.campaignId)
  if (!campaign) return { success: false, code: 'NOT_FOUND' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  const membership = principal.memberships.find(
    (m) => m.workspaceId === campaign.workspaceId,
  )
  const isWorkspaceReader =
    membership !== undefined &&
    WORKSPACE_READER_ROLES.includes(
      membership.role as 'OWNER' | 'EDITOR' | 'FINANCIAL' | 'ADMIN',
    )

  if (!isAdmin && !isWorkspaceReader)
    return { success: false, code: 'FORBIDDEN' }

  const data = await donationRepo.listByCampaign(input.campaignId, {
    status: input.status,
    page: input.page,
    perPage: input.perPage,
  })
  return { success: true, data }
}
