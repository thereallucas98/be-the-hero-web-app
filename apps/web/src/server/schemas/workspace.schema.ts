import { z } from 'zod'

export const UpdateWorkspaceSchema = z
  .object({
    name: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    emailPublic: z.email().optional(),
    website: z.union([z.string().url(), z.literal('')]).optional(),
    instagram: z.string().optional(),
  })
  .strict()

export type UpdateWorkspaceInput = z.infer<typeof UpdateWorkspaceSchema>

export const CreateWorkspaceSchema = z.object({
  name: z.string().min(3),
  type: z.enum(['ONG', 'CLINIC', 'PETSHOP', 'INDEPENDENT']),
  description: z.string().min(10),

  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  emailPublic: z.email().optional(),

  cityPlaceId: z.string(),
  lat: z.number(),
  lng: z.number(),
  addressLine: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
})
