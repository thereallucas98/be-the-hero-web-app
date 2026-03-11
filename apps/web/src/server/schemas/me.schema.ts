import { z } from 'zod'

export const UpdateMeSchema = z
  .object({
    fullName: z.string().min(2).optional(),
    phone: z.string().min(8).optional(),
  })
  .refine((data) => data.fullName !== undefined || data.phone !== undefined, {
    message: 'At least one field (fullName or phone) must be provided.',
  })

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8),
})
