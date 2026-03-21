import type {
  CampaignRepository,
  ListCampaignsResult,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListAdminCampaignsInput {
  status?: string
  workspaceId?: string
  page: number
  perPage: number
}

export type ListAdminCampaignsResult =
  | { success: true; data: ListCampaignsResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listAdminCampaigns(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  input: ListAdminCampaignsInput,
): Promise<ListAdminCampaignsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const data = await campaignRepo.listForAdmin(input)
  return { success: true, data }
}
