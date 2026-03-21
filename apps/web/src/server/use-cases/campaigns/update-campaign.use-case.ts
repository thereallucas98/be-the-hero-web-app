import type {
  CampaignItem,
  CampaignRepository,
  UpdateCampaignData,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface UpdateCampaignInput {
  campaignId: string
  data: UpdateCampaignData
}

export type UpdateCampaignResult =
  | { success: true; campaign: CampaignItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CAMPAIGN_NOT_EDITABLE'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function updateCampaign(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  input: UpdateCampaignInput,
): Promise<UpdateCampaignResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const campaign = await campaignRepo.findById(input.campaignId)
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
    return { success: false, code: 'CAMPAIGN_NOT_EDITABLE' }

  const updated = await campaignRepo.update(input.campaignId, input.data)
  return { success: true, campaign: updated }
}
