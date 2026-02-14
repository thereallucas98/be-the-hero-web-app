import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'

// Template: add your app abilities schema here
const appAbilitiesSchema = z.tuple([
  z.literal('manage'),
  z.literal('all'),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>
export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  // Template: add your role-based permissions here
  // Example: if (user.role === 'ADMIN') builder.can('manage', 'all')

  return builder.build()
}
