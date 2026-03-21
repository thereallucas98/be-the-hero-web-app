import type {
  AdminSubmissionListItem,
  FollowUpRepository,
  ListSubmissionsAdminResult,
} from '../../repositories/follow-up.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
  adminCities: string[]
}

export interface ListFollowUpSubmissionsAdminInput {
  status?: string
  workspaceId?: string
  page?: number
  perPage?: number
}

export type ListFollowUpSubmissionsAdminResult =
  | {
      success: true
      items: AdminSubmissionListItem[]
      total: number
      page: number
      perPage: number
    }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const

export async function listFollowUpSubmissionsAdmin(
  followUpRepo: FollowUpRepository,
  principal: Principal | null,
  input: ListFollowUpSubmissionsAdminInput,
): Promise<ListFollowUpSubmissionsAdminResult> {
  if (!principal) {
    return { success: false, code: 'UNAUTHENTICATED' }
  }

  const isAdmin = ADMIN_ROLES.includes(
    principal.role as 'ADMIN' | 'SUPER_ADMIN',
  )
  if (!isAdmin) {
    return { success: false, code: 'FORBIDDEN' }
  }

  const result: ListSubmissionsAdminResult =
    await followUpRepo.listSubmissionsAdmin({
      status: input.status,
      workspaceId: input.workspaceId,
      page: input.page,
      perPage: input.perPage,
    })

  return {
    success: true,
    items: result.items,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
  }
}
