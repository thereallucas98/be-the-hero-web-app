import { z } from 'zod'

export const RegisterDonationSchema = z
  .object({
    amount: z.number().positive(),
    currency: z.string().length(3).optional().default('BRL'),
    paymentMethod: z.enum(['PIX', 'TRANSFER', 'OTHER']),
    proofUrl: z.url(),
    storagePath: z.string().min(1),
    mimeType: z.string().min(1),
    fileSize: z.number().int().positive(),
  })
  .strict()

export type RegisterDonationInput = z.infer<typeof RegisterDonationSchema>

export const ListDonationsQuerySchema = z.object({
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(10),
})

export type ListDonationsQueryInput = z.infer<typeof ListDonationsQuerySchema>

export const ListAdminDonationsQuerySchema = z.object({
  campaignId: z.uuid().optional(),
  workspaceId: z.uuid().optional(),
  userId: z.uuid().optional(),
  status: z.enum(['PENDING_REVIEW', 'APPROVED', 'REJECTED']).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(10),
})

export type ListAdminDonationsQueryInput = z.infer<
  typeof ListAdminDonationsQuerySchema
>

export const RejectDonationSchema = z
  .object({
    reviewNote: z.string().min(1).max(1000),
  })
  .strict()

export type RejectDonationInput = z.infer<typeof RejectDonationSchema>
