import { z } from 'zod'

export const ListMyInterestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(10),
})

export type ListMyInterestsQueryInput = z.infer<
  typeof ListMyInterestsQuerySchema
>

export const ConvertInterestSchema = z
  .object({
    notes: z.string().max(1000).optional(),
    adoptedAt: z.string().datetime().optional(),
  })
  .strict()

export type ConvertInterestInput = z.infer<typeof ConvertInterestSchema>
