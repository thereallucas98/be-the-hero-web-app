import { z } from 'zod'

// Template: add your application roles here
export const roleSchema = z.enum(['ADMIN', 'USER'])

export type Role = z.infer<typeof roleSchema>
