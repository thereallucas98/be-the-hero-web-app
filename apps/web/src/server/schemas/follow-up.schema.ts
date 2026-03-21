import { z } from 'zod'

export const SubmitFollowUpSchema = z
  .object({
    photoUrl: z.url(),
    storagePath: z.string().min(1),
    mimeType: z.string().min(1),
    fileSize: z.number().int().positive(),
    message: z.string().max(1000).optional(),
  })
  .strict()

export type SubmitFollowUpInput = z.infer<typeof SubmitFollowUpSchema>

export const ReviewSubmissionSchema = z
  .object({
    reviewNote: z.string().min(1).max(1000),
  })
  .strict()

export type ReviewSubmissionInput = z.infer<typeof ReviewSubmissionSchema>

export const ListFollowUpSubmissionsQuerySchema = z.object({
  status: z.enum(['SUBMITTED', 'APPROVED', 'REJECTED']).optional(),
  workspaceId: z.uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(20),
})

export type ListFollowUpSubmissionsQueryInput = z.infer<
  typeof ListFollowUpSubmissionsQuerySchema
>

export const ListGuardianAdoptionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(10),
})

export type ListGuardianAdoptionsQueryInput = z.infer<
  typeof ListGuardianAdoptionsQuerySchema
>
