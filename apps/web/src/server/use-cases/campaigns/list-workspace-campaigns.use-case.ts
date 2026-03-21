import type {
  CampaignRepository,
  ListCampaignsResult,
} from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListWorkspaceCampaignsInput {
  workspaceId: string
  status?: string
  page: number
  perPage: number
}

export type ListWorkspaceCampaignsResult =
  | { success: true; result: ListCampaignsResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const MEMBER_ROLES = ['OWNER', 'EDITOR', 'FINANCIAL'] as const

export async function listWorkspaceCampaigns(
  campaignRepo: CampaignRepository,
  principal: Principal | null,
  input: ListWorkspaceCampaignsInput,
): Promise<ListWorkspaceCampaignsResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const isAdmin = principal.role === 'ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === input.workspaceId,
  )
  const isMember =
    membership !== undefined &&
    MEMBER_ROLES.includes(membership.role as 'OWNER' | 'EDITOR' | 'FINANCIAL')

  if (!isSuperAdmin && !isAdmin && !isMember) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const result = await campaignRepo.listByWorkspace(input.workspaceId, {
    status: input.status,
    page: input.page,
    perPage: input.perPage,
  })

  return { success: true, result }
}
