import type {
  CampaignItem,
  CampaignRepository,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type SubmitCampaignForReviewResult =
  | { success: true; campaign: CampaignItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CAMPAIGN_NOT_REVIEWABLE'
        | 'NO_DOCUMENTS'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function submitCampaignForReview(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  campaignId: string,
): Promise<SubmitCampaignForReviewResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const campaign = await campaignRepo.findById(campaignId)
  if (!campaign) return { success: false, code: 'NOT_FOUND' }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === campaign.workspaceId,
  )
  const isEditor =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')

  if (!isSuperAdmin && !isEditor) return { success: false, code: 'FORBIDDEN' }

  if (campaign.status !== 'DRAFT')
    return { success: false, code: 'CAMPAIGN_NOT_REVIEWABLE' }

  const docCount = await campaignRepo.countDocuments(campaignId)
  if (docCount === 0) return { success: false, code: 'NO_DOCUMENTS' }

  const updated = await campaignRepo.submitForReview(campaignId)
  return { success: true, campaign: updated }
}
