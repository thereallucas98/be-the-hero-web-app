import type { AdoptionInterestRepository } from '../../repositories/adoption-interest.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface DismissAdoptionInterestInput {
  workspaceId: string
  interestId: string
}

export type DismissAdoptionInterestResult =
  | { success: true }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' | 'NOT_FOUND' }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function dismissAdoptionInterest(
  adoptionInterestRepo: AdoptionInterestRepository,
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: DismissAdoptionInterestInput,
): Promise<DismissAdoptionInterestResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const interest = await adoptionInterestRepo.findByIdForWorkspace(
    input.interestId,
    input.workspaceId,
  )
  if (!interest) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const workspace = await workspaceRepo.findByIdForInterestsAccess(
    input.workspaceId,
  )
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'
  const membership = principal.memberships.find(
    (m) => m.workspaceId === input.workspaceId,
  )
  const isEditorMember =
    membership !== undefined &&
    EDITOR_ROLES.includes(membership.role as 'OWNER' | 'EDITOR')

  if (!isSuperAdmin && !isEditorMember) {
    return { success: false, code: 'FORBIDDEN' }
  }

  await adoptionInterestRepo.deleteById(input.interestId)

  return { success: true }
}
