import type {
  CampaignDetailItem,
  CampaignRepository,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type GetCampaignByIdResult =
  | { success: true; campaign: CampaignDetailItem }
  | { success: false; code: 'NOT_FOUND' | 'FORBIDDEN' }

const MEMBER_ROLES = ['OWNER', 'EDITOR', 'FINANCIAL'] as const

export async function getCampaignById(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  campaignId: string,
): Promise<GetCampaignByIdResult> {
  const campaign = await campaignRepo.findById(campaignId)
  if (!campaign) return { success: false, code: 'NOT_FOUND' }

  if (campaign.status === 'APPROVED') {
    return { success: true, campaign }
  }

  if (!principal) return { success: false, code: 'FORBIDDEN' }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const isAdmin = principal.role === 'ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === campaign.workspaceId,
  )
  const isMember =
    membership !== undefined &&
    MEMBER_ROLES.includes(membership.role as 'OWNER' | 'EDITOR' | 'FINANCIAL')

  if (!isSuperAdmin && !isAdmin && !isMember) {
    return { success: false, code: 'FORBIDDEN' }
  }

  return { success: true, campaign }
}
