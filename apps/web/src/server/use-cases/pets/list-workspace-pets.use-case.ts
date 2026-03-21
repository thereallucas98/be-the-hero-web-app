import type { WorkspaceRepository } from '../../repositories/workspace.repository'
import type {
  PetRepository,
  ListWorkspacePetsResult,
} from '../../repositories/pet.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListWorkspacePetsInput {
  workspaceId: string
  status?: string
  page?: number
  perPage?: number
}

export type ListWorkspacePetsUseCaseResult =
  | ({ success: true } & ListWorkspacePetsResult)
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

const MEMBER_ROLES = ['OWNER', 'EDITOR', 'FINANCIAL'] as const
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN'] as const

export async function listWorkspacePets(
  petRepo: PetRepository,
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: ListWorkspacePetsInput,
): Promise<ListWorkspacePetsUseCaseResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace || !workspace.isActive) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'SUPER_ADMIN' | 'ADMIN',
  )
  const membership = principal.memberships.find(
    (m) => m.workspaceId === input.workspaceId,
  )
  const isMember =
    membership !== undefined &&
    MEMBER_ROLES.includes(membership.role as 'OWNER' | 'EDITOR' | 'FINANCIAL')

  if (!isAdmin && !isMember) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const result = await petRepo.listByWorkspace(input.workspaceId, {
    status: input.status,
    page: input.page,
    perPage: input.perPage,
  })

  return { success: true, ...result }
}
