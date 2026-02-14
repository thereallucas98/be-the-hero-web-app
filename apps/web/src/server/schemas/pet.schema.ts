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
