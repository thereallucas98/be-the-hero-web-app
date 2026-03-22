import { z } from 'zod'

export const PlatformMetricsQuerySchema = z.object({
  cityId: z.uuid().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
})

export type PlatformMetricsQueryInput = z.infer<
  typeof PlatformMetricsQuerySchema
>
