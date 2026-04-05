import { builder } from '../builder'

export const PetImageType = builder.simpleObject('PetImage', {
  fields: (t) => ({
    url: t.string(),
  }),
})

export const PetType = builder.simpleObject('Pet', {
  fields: (t) => ({
    id: t.id(),
    name: t.string(),
    species: t.string(),
    sex: t.string(),
    size: t.string(),
    ageCategory: t.string(),
    coverImage: t.field({ type: PetImageType, nullable: true }),
  }),
})

export const PetDetailType = builder.simpleObject('PetDetail', {
  fields: (t) => ({
    id: t.id(),
    name: t.string(),
    description: t.string(),
    species: t.string(),
    sex: t.string(),
    size: t.string(),
    ageCategory: t.string(),
  }),
})
