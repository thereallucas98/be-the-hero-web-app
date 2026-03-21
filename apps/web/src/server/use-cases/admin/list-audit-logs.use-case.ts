import type {
  AuditRepository,
  ListAuditLogsResult,
} from '../../repositories/audit.repository'

export interface Principal {
  userId: string
  role: string
  memberships: Array<{ workspaceId: string; role: string }>
}

export interface ListAuditLogsInput {
  actorId?: string
  entityType?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  page: number
  perPage: number
}

export type ListAuditLogsResult2 =
  | { success: true; data: ListAuditLogsResult }
  | { success: false; code: 'UNAUTHENTICATED' | 'FORBIDDEN' }

const SUPER_ADMIN_ROLES = ['SUPER_ADMIN'] as const

export async function listAuditLogs(
  auditRepo: AuditRepository,
  principal: Principal | null,
  input: ListAuditLogsInput,
): Promise<ListAuditLogsResult2> {
  if (!principal) return { success: false, code: 'UNAUTHENTICATED' }

  const isSuperAdmin = SUPER_ADMIN_ROLES.includes(
    principal.role as 'SUPER_ADMIN',
  )
  if (!isSuperAdmin) return { success: false, code: 'FORBIDDEN' }

  const data = await auditRepo.listLogs(input)
  return { success: true, data }
}
