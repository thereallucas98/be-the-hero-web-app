'use client'

import { useQuery } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type { AdoptionQuery, AdoptionQueryVariables } from '~/generated/graphql'

const ADOPTION_QUERY = /* GraphQL */ `
  query Adoption($id: ID!) {
    adoption(id: $id) {
      id
      petId
      workspaceId
      guardianUserId
      adoptedAt
      notes
      status
      createdAt
      pet {
        id
        name
        description
        species
        sex
        size
        ageCategory
      }
      guardian {
        id
        fullName
        email
      }
      workspace {
        id
        name
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
  }
`

export function useAdoption(id: string) {
  return useQuery({
    queryKey: ['adoption', id],
    queryFn: () =>
      graphqlClient.request<AdoptionQuery, AdoptionQueryVariables>(
        ADOPTION_QUERY,
        { id },
      ),
    select: (data) => data.adoption,
    enabled: !!id,
  })
}
