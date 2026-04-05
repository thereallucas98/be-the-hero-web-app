'use client'

import { useQuery } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type {
  MyAdoptionsQuery,
  MyAdoptionsQueryVariables,
} from '~/generated/graphql'

const MY_ADOPTIONS_QUERY = /* GraphQL */ `
  query MyAdoptions($page: Int, $perPage: Int) {
    myAdoptions(page: $page, perPage: $perPage) {
      items {
        id
        adoptedAt
        status
        notes
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
        followUps {
          id
          type
          status
          scheduledAt
          currentSubmission {
            id
            status
            submittedAt
          }
        }
      }
      total
      page
      perPage
    }
  }
`

export function useMyAdoptions(
  variables: MyAdoptionsQueryVariables = { page: 1, perPage: 10 },
) {
  return useQuery({
    queryKey: ['myAdoptions', variables],
    queryFn: () =>
      graphqlClient.request<MyAdoptionsQuery, MyAdoptionsQueryVariables>(
        MY_ADOPTIONS_QUERY,
        variables,
      ),
    select: (data) => data.myAdoptions,
  })
}
