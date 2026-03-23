import { z } from 'zod'

const speciesEnum = z.enum([
  'DOG',
  'CAT',
  'RABBIT',
  'BIRD',
  'HORSE',
  'COW',
  'GOAT',
  'PIG',
  'TURTLE',
  'OTHER',
])
const sexEnum = z.enum(['MALE', 'FEMALE'])
const sizeEnum = z.enum(['SMALL', 'MEDIUM', 'LARGE'])
const ageCategoryEnum = z.enum(['PUPPY', 'YOUNG', 'ADULT', 'SENIOR'])
const energyLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const independenceLevelEnum = z.enum(['LOW', 'MEDIUM', 'HIGH'])
const environmentEnum = z.enum(['HOUSE', 'APARTMENT', 'BOTH'])

export const CreatePetSchema = z
  .object({
    name: z.string().min(2),
    description: z.string().min(10),
    species: speciesEnum,
    sex: sexEnum,
    size: sizeEnum,
    ageCategory: ageCategoryEnum,
    energyLevel: energyLevelEnum.optional(),
    independenceLevel: independenceLevelEnum.optional(),
    environment: environmentEnum.optional(),
    adoptionRequirements: z.string().optional(),
  })
  .strict()

export type CreatePetInput = z.infer<typeof CreatePetSchema>

export const UpdatePetSchema = z
  .object({
    name: z.string().min(2).optional(),
    description: z.string().min(10).optional(),
    species: speciesEnum.optional(),
    sex: sexEnum.optional(),
    size: sizeEnum.optional(),
    ageCategory: ageCategoryEnum.optional(),
    energyLevel: energyLevelEnum.optional(),
    independenceLevel: independenceLevelEnum.optional(),
    environment: environmentEnum.optional(),
    adoptionRequirements: z.string().optional(),
  })
  .strict()

export type UpdatePetInput = z.infer<typeof UpdatePetSchema>

export const RejectPetSchema = z
  .object({
    reviewNote: z.string().min(1, 'Review note is required'),
  })
  .strict()

export type RejectPetInput = z.infer<typeof RejectPetSchema>

export const ListPetsQuerySchema = z.object({
  cityPlaceId: z.string().uuid().optional(),
  workspaceId: z.uuid().optional(),
  species: speciesEnum.optional(),
  sex: sexEnum.optional(),
  size: sizeEnum.optional(),
  ageCategory: ageCategoryEnum.optional(),
  energyLevel: energyLevelEnum.optional(),
  independenceLevel: independenceLevelEnum.optional(),
  hasRequirements: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(20).optional().default(20),
})

export type ListPetsQueryInput = z.infer<typeof ListPetsQuerySchema>

const requirementCategoryEnum = z.enum([
  'HOME',
  'EXPERIENCE',
  'TIME_AVAILABILITY',
  'FINANCIAL',
  'SAFETY',
  'HEALTH_CARE',
  'OTHER',
])

export const AddPetRequirementSchema = z
  .object({
    category: requirementCategoryEnum,
    title: z.string().min(3).max(100),
    description: z.string().max(500).optional(),
    isMandatory: z.boolean().default(true),
    order: z.number().int().min(1),
  })
  .strict()

export type AddPetRequirementInput = z.infer<typeof AddPetRequirementSchema>

export const UpdatePetRequirementSchema = z
  .object({
    category: requirementCategoryEnum.optional(),
    title: z.string().min(3).max(100).optional(),
    description: z.string().max(500).optional(),
    isMandatory: z.boolean().optional(),
    order: z.number().int().min(1).optional(),
  })
  .strict()

export type UpdatePetRequirementInput = z.infer<
  typeof UpdatePetRequirementSchema
>

export const TrackPetEventSchema = z
  .object({
    type: z.enum(['VIEW_PET', 'CLICK_WHATSAPP', 'REGISTER_INTEREST']),
  })
  .strict()

export type TrackPetEventInput = z.infer<typeof TrackPetEventSchema>

export const ListWorkspacePetsQuerySchema = z.object({
  status: z
    .enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'ADOPTED'])
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(50).optional().default(20),
})

export type ListWorkspacePetsQueryInput = z.infer<
  typeof ListWorkspacePetsQuerySchema
>

export const RegisterAdoptionInterestSchema = z
  .object({
    message: z.string().optional(),
  })
  .strict()

export type RegisterAdoptionInterestInput = z.infer<
  typeof RegisterAdoptionInterestSchema
>
