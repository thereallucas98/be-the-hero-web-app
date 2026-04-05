import { builder } from '../builder'

export const UserType = builder.simpleObject('User', {
  fields: (t) => ({
    id: t.id(),
    fullName: t.string(),
    email: t.string(),
    role: t.string(),
    emailVerified: t.boolean(),
  }),
})
