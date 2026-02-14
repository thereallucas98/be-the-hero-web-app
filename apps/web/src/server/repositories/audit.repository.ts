import type { Prisma, PrismaClient } from '~/generated/prisma/client'

export interface CreateAuditLogInput {
  actorUserId: string
  action: 'CREATE' | 'UPDATE' | 'SUBMIT_FOR_REVIEW' | 'APPROVE' | 'REJECT'
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

export interface AuditRepository {
  createLog(input: CreateAuditLogInput): Promise<void>
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
  }
}
