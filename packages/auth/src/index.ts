import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { z } from 'zod'

import { User } from './models/user'
import { MODERATOR_ROLES } from './roles'

export { roleSchema, type Role, MODERATOR_ROLES, PUBLIC_REGISTRABLE_ROLES } from './roles'
export { userSchema, type User } from './models/user'

// BeTheHero subjects (entities that can be moderated/acted upon)
const subjects = [
  'PartnerWorkspace',
  'Pet',
  'PetImage',
  'Campaign',
  'CampaignDocument',
  'Donation',
  'Adoption',
  'AdoptionFollowUp',
  'AdoptionFollowUpSubmission',
  'AdminCoverage',
  'AdoptionInterest',
  'User',
] as const

const appAbilitiesSchema = z.tuple([
  z.enum(['manage', 'create', 'read', 'update', 'delete', 'approve', 'reject']),
  z.union([z.literal('all'), z.enum(subjects)]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>
export type AppAbility = MongoAbility<[AppAbilities[0], AppAbilities[1]]>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (user.role === 'SUPER_ADMIN') {
    builder.can('manage', 'all')
    return builder.build()
  }

  if (user.role === 'ADMIN') {
    builder.can('manage', [
      'PartnerWorkspace',
      'Pet',
      'PetImage',
      'Campaign',
      'CampaignDocument',
      'Donation',
      'AdoptionFollowUpSubmission',
      'AdminCoverage',
    ])
    builder.can('read', ['Adoption', 'AdoptionFollowUp', 'AdoptionInterest', 'User'])
    return builder.build()
  }

  if (user.role === 'GUARDIAN') {
    builder.can('create', ['AdoptionInterest', 'Donation', 'AdoptionFollowUpSubmission'])
    builder.can('read', ['Pet', 'Campaign', 'PartnerWorkspace'])
    builder.can('update', ['AdoptionFollowUpSubmission']) // own submissions
    return builder.build()
  }

  if (user.role === 'PARTNER_MEMBER') {
    builder.can('manage', ['Pet', 'Campaign', 'CampaignDocument', 'Donation', 'Adoption'])
    builder.can('read', ['PartnerWorkspace', 'AdoptionFollowUp', 'AdoptionFollowUpSubmission'])
    return builder.build()
  }

  return builder.build()
}

/** Check if role can moderate (approve/reject) platform content */
export function isModerator(role: User['role']) {
  return MODERATOR_ROLES.includes(role)
}
