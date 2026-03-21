import type {
  CampaignItem,
  CampaignRepository,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type ApproveCampaignResult =
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

export async function approveCampaign(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  campaignId: string,
): Promise<ApproveCampaignResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const existing = await campaignRepo.findById(campaignId)
  if (!existing) return { success: false, code: 'NOT_FOUND' }

  if (existing.status !== 'PENDING_REVIEW') {
    return { success: false, code: 'CAMPAIGN_NOT_REVIEWABLE' }
  }

  const campaign = await campaignRepo.approve(campaignId, principal.userId)
  return { success: true, campaign }
}
