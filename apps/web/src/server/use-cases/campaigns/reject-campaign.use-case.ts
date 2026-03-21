import type {
  CampaignItem,
  CampaignRepository,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface RejectCampaignInput {
  campaignId: string
  reviewNote: string
}

export type RejectCampaignResult =
  | { success: true; campaign: CampaignItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CAMPAIGN_NOT_REVIEWABLE'
    }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function rejectCampaign(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  input: RejectCampaignInput,
): Promise<RejectCampaignResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await campaignRepo.findById(input.campaignId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.status !== 'PENDING_REVIEW') {
    return { success: false, code: 'CAMPAIGN_NOT_REVIEWABLE' }
  }

  const campaign = await campaignRepo.reject(input.campaignId, input.reviewNote)
  return { success: true, campaign }
}
