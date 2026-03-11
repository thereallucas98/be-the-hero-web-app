import type { WorkspaceRepository } from '../../repositories/workspace.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListCityCoverageInput {
  workspaceId: string
}

export type ListCityCoverageResult =
  | {
      success: true
      items: Array<{
        id: string
        cityPlace: { id: string; name: string; slug: string; type: string }
      }>
    }
  | { success: false; code: 'UNAUTHENTICATED' | 'NOT_FOUND' | 'FORBIDDEN' }

function isMember(principal: Principal, workspaceId: string): boolean {
  return (
    principal.role === 'SUPER_ADMIN' ||
    principal.role === 'ADMIN' ||
    principal.memberships.some((m) => m.workspaceId === workspaceId)
  )
}

export async function listCityCoverage(
  workspaceRepo: WorkspaceRepository,
  principal: Principal | null,
  input: ListCityCoverageInput,
): Promise<ListCityCoverageResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  if (!isMember(principal, input.workspaceId)) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const workspace = await workspaceRepo.findByIdWithDetails(input.workspaceId)
  if (!workspace) {
    return { success: false, code: 'NOT_FOUND' }
  }

  const items = await workspaceRepo.listCityCoverage(input.workspaceId)
  return { success: true, items }
}
