import type {
  CampaignDocumentItem,
  CampaignDocumentRepository,
} from '../../repositories/campaign-document.repository'
import type { CampaignRepository } from '../../repositories/campaign.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface AddCampaignDocumentInput {
  campaignId: string
  type: string
  title: string
  description: string
  fileUrl: string
  storagePath: string
  mimeType: string
  fileSize: number
}

export type AddCampaignDocumentResult =
  | { success: true; document: CampaignDocumentItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'CAMPAIGN_NOT_EDITABLE'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function addCampaignDocument(
  campaignRepo: CampaignRepository,
  campaignDocumentRepo: CampaignDocumentRepository,
  principal: Principal | null,
  input: AddCampaignDocumentInput,
): Promise<AddCampaignDocumentResult> {
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

  const document = await campaignDocumentRepo.create({
    campaignId: input.campaignId,
    type: input.type,
    title: input.title,
    description: input.description,
    fileUrl: input.fileUrl,
    storagePath: input.storagePath,
    mimeType: input.mimeType,
    fileSize: input.fileSize,
  })

  return { success: true, document }
}
