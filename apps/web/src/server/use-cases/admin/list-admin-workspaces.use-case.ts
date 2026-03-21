import type {
  ListAdminWorkspacesResult,
  WorkspaceRepository,
} from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListAdminWorkspacesInput {
  verificationStatus?: string
  page: number
  perPage: number
}

export type ListAdminWorkspacesResult2 =
  | { success: true; data: ListAdminWorkspacesResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listAdminWorkspaces(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: ListAdminWorkspacesInput,
): Promise<ListAdminWorkspacesResult2> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) return { success: false, code: 'FORBIDDEN' }

  const data = await workspaceRepo.listForAdmin(input)
  return { success: true, data }
}
