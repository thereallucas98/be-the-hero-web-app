import { roleSchema } from '@bethehero/auth'
import { z } from 'zod'

export const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.email(),
  password: z.string().min(8),
  role: roleSchema.default('GUARDIAN'),
})

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
})
