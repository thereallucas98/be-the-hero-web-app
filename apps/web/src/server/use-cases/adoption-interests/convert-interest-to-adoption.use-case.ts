import { Prisma } from '~/generated/prisma/client'
import type { AdoptionInterestRepository } from '../../repositories/adoption-interest.repository'
import type {
  AdoptionRepository,
  CreatedAdoptionItem,
} from '../../repositories/adoption.repository'
import type { PetRepository } from '../../repositories/pet.repository'
import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface ConvertInterestToAdoptionInput {
  workspaceId: string
  interestId: string
  notes?: string
  adoptedAt?: string
}

export type ConvertInterestToAdoptionResult =
  | { success: true; adoption: CreatedAdoptionItem }
  | {
      success: false
      code:
        | 'UNAUTHENTICATED'
        | 'FORBIDDEN'
        | 'NOT_FOUND'
        | 'PET_ALREADY_ADOPTED'
        | 'PET_NOT_APPROVED'
        | 'WORKSPACE_BLOCKED'
    }

const EDITOR_ROLES = ['OWNER', 'EDITOR'] as const

export async function convertInterestToAdoption(
  adoptionInterestRepo: AdoptionInterestRepository,
  petRepo: PetRepository,
  workspaceRepo: WorkspaceRepository,
  adoptionRepo: AdoptionRepository,
  principal: Principal | null,
  input: ConvertInterestToAdoptionInput,
): Promise<ConvertInterestToAdoptionResult> {
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

  const pet = await petRepo.findByIdForAdoption(interest.petId)
  if (!pet) {
    return { success: false, code: 'NOT_FOUND' }
  }

  if (pet.hasAdoption) {
    return { success: false, code: 'PET_ALREADY_ADOPTED' }
  }

  if (pet.status !== 'APPROVED') {
    return { success: false, code: 'PET_NOT_APPROVED' }
  }

  if (
    !pet.workspace.isActive ||
    pet.workspace.verificationStatus !== 'APPROVED'
  ) {
    return { success: false, code: 'WORKSPACE_BLOCKED' }
  }

  const adoptedAt = input.adoptedAt ? new Date(input.adoptedAt) : new Date()

  try {
    const adoption = await adoptionRepo.create({
      petId: interest.petId,
      guardianUserId: interest.userId,
      workspaceId: input.workspaceId,
      adoptedAt,
      notes: input.notes ?? null,
      createdByUserId: principal.userId,
    })

    await adoptionInterestRepo.deleteById(input.interestId)

    return { success: true, adoption }
  } catch (e: unknown) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === 'P2002'
    ) {
      return { success: false, code: 'PET_ALREADY_ADOPTED' }
    }
    throw e
  }
}
