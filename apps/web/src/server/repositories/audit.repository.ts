import type { Prisma, PrismaClient } from '~/generated/prisma/client'

export interface CreateAuditLogInput {
  actorUserId: string
  action:
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'SUBMIT_FOR_REVIEW'
    | 'APPROVE'
    | 'REJECT'
  entityType:
    | 'PARTNER_WORKSPACE'
    | 'PET'
    | 'PET_IMAGE'
    | 'CAMPAIGN'
    | 'CAMPAIGN_DOCUMENT'
    | 'DONATION'
    | 'ADOPTION'
    | 'FOLLOW_UP'
    | 'FOLLOW_UP_SUBMISSION'
    | 'USER'
  entityId: string
  metadata?: Record<string, unknown>
}

export interface AuditLogItem {
  id: string
  actorUserId: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: Date
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

export interface ListAuditLogsResult {
  data: AuditLogItem[]
  total: number
  page: number
  perPage: number
}

export interface AuditRepository {
  createLog(input: CreateAuditLogInput): Promise<void>
  listLogs(input: ListAuditLogsInput): Promise<ListAuditLogsResult>
}

export function createAuditRepository(prisma: PrismaClient): AuditRepository {
  return {
    async createLog(input) {
      await prisma.auditLog.create({
        data: {
          actorUserId: input.actorUserId,
          action: input.action,
          entityType: input.entityType,
          entityId: input.entityId,
          metadata: (input.metadata ?? undefined) as
            | Prisma.InputJsonValue
            | undefined,
        },
      })
    },

    async listLogs(input) {
      const where: Prisma.AuditLogWhereInput = {}
      if (input.actorId) where.actorUserId = input.actorId
      if (input.entityType) where.entityType = input.entityType as never
      if (input.action) where.action = input.action as never
      if (input.dateFrom || input.dateTo) {
        where.createdAt = {}
        if (input.dateFrom) where.createdAt.gte = new Date(input.dateFrom)
        if (input.dateTo) where.createdAt.lte = new Date(input.dateTo)
      }

      const skip = (input.page - 1) * input.perPage
      const [data, total] = await prisma.$transaction([
        prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: input.perPage,
          select: {
            id: true,
            actorUserId: true,
            action: true,
            entityType: true,
            entityId: true,
            metadata: true,
            createdAt: true,
          },
        }),
        prisma.auditLog.count({ where }),
      ])

      return {
        data: data.map((log) => ({
          ...log,
          action: String(log.action),
          entityType: String(log.entityType),
          metadata: log.metadata as Record<string, unknown> | null,
        })),
        total,
        page: input.page,
        perPage: input.perPage,
      }
    },
  }
}
