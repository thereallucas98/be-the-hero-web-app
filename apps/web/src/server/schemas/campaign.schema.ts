import { z } from 'zod'

export const CreateCampaignSchema = z
  .object({
    title: z.string().min(3).max(200),
    description: z.string().min(10).max(2000),
    goalAmount: z.number().positive(),
    currency: z.string().length(3).optional().default('BRL'),
    petId: z.uuid().optional(),
  })
  .strict()

export type CreateCampaignInput = z.infer<typeof CreateCampaignSchema>

export const UpdateCampaignSchema = z
  .object({
    title: z.string().min(3).max(200).optional(),
    description: z.string().min(10).max(2000).optional(),
    goalAmount: z.number().positive().optional(),
    currency: z.string().length(3).optional(),
    petId: z.uuid().nullable().optional(),
    coverImageUrl: z.url().nullable().optional(),
    startsAt: z.string().datetime().nullable().optional(),
    endsAt: z.string().datetime().nullable().optional(),
  })
  .strict()

export type UpdateCampaignInput = z.infer<typeof UpdateCampaignSchema>

export const RejectCampaignSchema = z
  .object({
    reviewNote: z.string().min(1).max(1000),
  })
  .strict()

export type RejectCampaignInput = z.infer<typeof RejectCampaignSchema>

export const ListCampaignsQuerySchema = z.object({
  status: z
    .enum([
      'DRAFT',
      'PENDING_DOCUMENTS',
      'PENDING_REVIEW',
      'APPROVED',
      'REJECTED',
      'CLOSED',
    ])
    .optional(),
  workspaceId: z.uuid().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(10),
})

export type ListCampaignsQueryInput = z.infer<typeof ListCampaignsQuerySchema>

export const AddCampaignDocumentSchema = z
  .object({
    type: z.enum([
      'MEDICAL_REPORT',
      'COST_ESTIMATE',
      'INVOICE',
      'PHOTO_EVIDENCE',
      'OTHER',
    ]),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(1000),
    fileUrl: z.url(),
    storagePath: z.string().min(1),
    mimeType: z.string().min(1),
    fileSize: z.number().int().positive(),
  })
  .strict()

export type AddCampaignDocumentInput = z.infer<typeof AddCampaignDocumentSchema>
