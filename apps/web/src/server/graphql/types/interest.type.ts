import { builder } from '../builder'
import { PetType } from './pet.type'

export const InterestType = builder.simpleObject('Interest', {
  fields: (t) => ({
    id: t.id(),
    message: t.string({ nullable: true }),
    channel: t.string(),
    createdAt: t.field({ type: 'DateTime' }),
    pet: t.field({ type: PetType }),
  }),
})

export const InterestPageType = builder.simpleObject('InterestPage', {
  fields: (t) => ({
    items: t.field({ type: [InterestType] }),
    total: t.int(),
    page: t.int(),
    perPage: t.int(),
  }),
})
