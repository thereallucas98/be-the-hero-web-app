import { z } from 'zod'

export const roleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'GUARDIAN',
  'PARTNER_MEMBER',
])

export type Role = z.infer<typeof roleSchema>

export const MODERATOR_ROLES: Role[] = ['SUPER_ADMIN', 'ADMIN']
export const PUBLIC_REGISTRABLE_ROLES: Role[] = ['GUARDIAN', 'PARTNER_MEMBER']
