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

export const UpdateWorkspaceLocationSchema = z
  .object({
    cityPlaceId: z.string(),
    lat: z.number(),
    lng: z.number(),
    addressLine: z.string().optional(),
    neighborhood: z.string().optional(),
    zipCode: z.string().optional(),
  })
  .strict()

export type UpdateWorkspaceLocationInput = z.infer<
  typeof UpdateWorkspaceLocationSchema
>

export const AddWorkspaceMemberSchema = z
  .object({
    email: z.email(),
    role: z.enum(['OWNER', 'EDITOR', 'FINANCIAL']),
  })
  .strict()

export type AddWorkspaceMemberInput = z.infer<typeof AddWorkspaceMemberSchema>

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

export const ListWorkspaceInterestsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(20),
})

export type ListWorkspaceInterestsQueryInput = z.infer<
  typeof ListWorkspaceInterestsQuerySchema
>
