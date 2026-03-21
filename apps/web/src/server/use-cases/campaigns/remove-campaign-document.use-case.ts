import type { CampaignDocumentRepository } from '../../repositories/campaign-document.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export type RemoveCampaignDocumentResult =
  | { success: true }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CAMPAIGN_NOT_EDITABLE'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function removeCampaignDocument(
  campaignDocumentRepo: CampaignDocumentRepository,
  principal: Principal | null,
  docId: string,
): Promise<RemoveCampaignDocumentResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const doc = await campaignDocumentRepo.findById(docId)
  if (!doc) return { success: false, code: 'NOT_FOUND' }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === doc.campaign.workspaceId,
  )
  const isEditor =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')

  if (!isSuperAdmin && !isEditor) return { success: false, code: 'FORBIDDEN' }

  if (doc.campaign.status !== 'DRAFT')
    return { success: false, code: 'CAMPAIGN_NOT_EDITABLE' }

  await campaignDocumentRepo.delete(docId)
  return { success: true }
}
