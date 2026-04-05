import { GraphQLClient } from 'graphql-request'

export const graphqlClient = new GraphQLClient('/api/graphql', {
  credentials: 'include',
})
