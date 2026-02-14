import { z } from 'zod'

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
