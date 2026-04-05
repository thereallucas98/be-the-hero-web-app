'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type {
  UpdateMeMutation,
  UpdateMeMutationVariables,
  UpdateMeInput,
} from '~/generated/graphql'

const UPDATE_ME_MUTATION = /* GraphQL */ `
  mutation UpdateMe($input: UpdateMeInput!) {
    updateMe(input: $input) {
      id
      fullName
      email
      role
      emailVerified
    }
  }
`

export function useUpdateMe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMeInput) =>
      graphqlClient.request<UpdateMeMutation, UpdateMeMutationVariables>(
        UPDATE_ME_MUTATION,
        { input },
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },

    meta: { successMessage: 'Perfil atualizado com sucesso' },
  })
}
