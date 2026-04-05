'use client'

import { useQuery } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type {
  MyInterestsQuery,
  MyInterestsQueryVariables,
} from '~/generated/graphql'

const MY_INTERESTS_QUERY = /* GraphQL */ `
  query MyInterests($page: Int, $perPage: Int) {
    myInterests(page: $page, perPage: $perPage) {
      items {
        id
        message
        channel
        createdAt
        pet {
          id
          name
          species
          sex
          size
          ageCategory
          coverImage {
            url
          }
        }
      }
      total
      page
      perPage
    }
  }
`

export function useMyInterests(
  variables: MyInterestsQueryVariables = { page: 1, perPage: 10 },
) {
  return useQuery({
    queryKey: ['myInterests', variables],
    queryFn: () =>
      graphqlClient.request<MyInterestsQuery, MyInterestsQueryVariables>(
        MY_INTERESTS_QUERY,
        variables,
      ),
    select: (data) => data.myInterests,
  })
}
