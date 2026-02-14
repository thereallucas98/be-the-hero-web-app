import { z } from 'zod'

export const RegisterAdoptionSchema = z
  .object({
    petId: z.string().uuid(),
    guardianUserId: z.string().uuid(),
    adoptedAt: z.string().datetime().optional(),
    notes: z.string().optional(),
  })
  .strict()

export type RegisterAdoptionInput = z.infer<typeof RegisterAdoptionSchema>
