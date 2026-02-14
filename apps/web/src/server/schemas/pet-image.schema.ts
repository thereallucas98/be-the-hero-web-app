import { z } from 'zod'

export const AddPetImageSchema = z
  .object({
    url: z.string().url(),
    storagePath: z.string().min(1),
    position: z.number().int().min(1).max(5),
    isCover: z.boolean(),
  })
  .strict()

export type AddPetImageInput = z.infer<typeof AddPetImageSchema>
