import { z } from 'zod'

export const AddAdminCoverageSchema = z
  .object({
    adminUserId: z.uuid(),
    cityId: z.uuid(),
  })
  .strict()

export type AddAdminCoverageInput = z.infer<typeof AddAdminCoverageSchema>

export const ListAdminWorkspacesQuerySchema = z.object({
  verificationStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(10),
})

export type ListAdminWorkspacesQueryInput = z.infer<
  typeof ListAdminWorkspacesQuerySchema
>

export const RejectWorkspaceSchema = z
  .object({
    reviewNote: z.string().min(1).max(1000),
  })
  .strict()

export type RejectWorkspaceInput = z.infer<typeof RejectWorkspaceSchema>

export const ListAuditLogsQuerySchema = z.object({
  actorId: z.uuid().optional(),
  entityType: z
    .enum([
      'PARTNER_WORKSPACE',
      'PET',
      'PET_IMAGE',
      'ADOPTION_INTEREST',
      'CAMPAIGN',
      'CAMPAIGN_DOCUMENT',
      'DONATION',
      'ADOPTION',
      'FOLLOW_UP',
      'FOLLOW_UP_SUBMISSION',
      'USER',
    ])
    .optional(),
  action: z
    .enum([
      'CREATE',
      'UPDATE',
      'DELETE',
      'SUBMIT_FOR_REVIEW',
      'APPROVE',
      'REJECT',
      'STATUS_CHANGE',
    ])
    .optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(20),
})

export type ListAuditLogsQueryInput = z.infer<typeof ListAuditLogsQuerySchema>
