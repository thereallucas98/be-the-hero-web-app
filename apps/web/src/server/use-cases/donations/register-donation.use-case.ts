import type { CampaignRepository } from '../../repositories/campaign.repository'
import type {
  DonationItem,
  DonationRepository,
} from '../../repositories/donation.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RegisterDonationInput {
  campaignId: string
  amount: number
  currency?: string
  paymentMethod: string
  proofUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
}

export type RegisterDonationResult =
  | { success: true; donation: DonationItem }
  | {
      success: false
      code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'CAMPAIGN_NOT_ACTIVE'
    }

export async function registerDonation(
  campaignRepo: CampaignRepository,
  donationRepo: DonationRepository,
  principal: Principal | null,
  input: RegisterDonationInput,
): Promise<RegisterDonationResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const campaign = await campaignRepo.findById(input.campaignId)
  if (!campaign) return { success: false, code: 'NOT_FOUND' }

  if (campaign.status !== 'APPROVED') {
    return { success: false, code: 'CAMPAIGN_NOT_ACTIVE' }
  }

  const donation = await donationRepo.create({
    campaignId: input.campaignId,
    workspaceId: campaign.workspaceId,
    userId: principal.userId,
    amount: input.amount,
    currency: input.currency,
    paymentMethod: input.paymentMethod,
    proofUrl: input.proofUrl,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
  })

  return { success: true, donation }
}
