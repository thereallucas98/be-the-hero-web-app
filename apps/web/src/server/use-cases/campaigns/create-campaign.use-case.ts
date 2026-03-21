import type {
  CampaignItem,
  CampaignRepository,
} from '../../repositories/campaign.repository'
import type { PetRepository } from '../../repositories/pet.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface CreateCampaignInput {
  workspaceId: string
  title: string
  description: string
  goalAmount: number
  currency?: string
  petId?: string
}

export type CreateCampaignResult =
  | { success: true; campaign: CampaignItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'WORKSPACE_NOT_FOUND'
        | 'WORKSPACE_BLOCKED'
        | 'PET_NOT_FOUND'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function createCampaign(
  campaignRepo: CampaignRepository,
  workspaceRepo: WorkspaceRepository,
  petRepo: PetRepository,
  principal: Principal | null,
  input: CreateCampaignInput,
): Promise<CreateCampaignResult> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const workspace = await workspaceRepo.findByIdSimple(input.workspaceId)
  if (!workspace) return { success: false, code: 'WORKSPACE_NOT_FOUND' }

  if (!workspace.isActive || workspace.verificationStatus !== 'APPROVED') {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === input.workspaceId,
  )
  const isEditor =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')

  if (!isSuperAdmin && !isEditor) return { success: false, code: 'FORBIDDEN' }

  if (input.petId) {
    const pet = await petRepo.findByIdForTracking(input.petId)
    if (!pet) return { success: false, code: 'PET_NOT_FOUND' }
  }

  const campaign = await campaignRepo.create({
    workspaceId: input.workspaceId,
    petId: input.petId,
    title: input.title,
    description: input.description,
    goalAmount: input.goalAmount,
    currency: input.currency,
    createdByUserId: principal.userId,
  })

  return { success: true, campaign }
}
