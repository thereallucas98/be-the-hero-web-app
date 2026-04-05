import { builder } from './builder'

// Import types so they register with the builder
import './types/user.type'
import './types/pet.type'
import './types/interest.type'
import './types/adoption.type'

// Import queries
import './queries/me.query'
import './queries/interests.query'
import './queries/adoptions.query'

// Import mutations
import './mutations/interests.mutation'
import './mutations/me.mutation'

export const schema = builder.toSchema()
