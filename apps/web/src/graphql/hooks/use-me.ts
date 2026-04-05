'use client'

import { useQuery } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type { MeQuery } from '~/generated/graphql'

const ME_QUERY = /* GraphQL */ `
  query Me {
    me {
      id
      fullName
      email
      role
      emailVerified
    }
  }
`

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => graphqlClient.request<MeQuery>(ME_QUERY),
    select: (data) => data.me,
  })
}
