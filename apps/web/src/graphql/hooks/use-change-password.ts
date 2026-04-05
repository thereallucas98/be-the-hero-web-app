'use client'

import { useMutation } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type {
  ChangePasswordMutation,
  ChangePasswordMutationVariables,
  ChangePasswordInput,
} from '~/generated/graphql'

const CHANGE_PASSWORD_MUTATION = /* GraphQL */ `
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`

export function useChangePassword() {
  return useMutation({
    mutationFn: (input: ChangePasswordInput) =>
      graphqlClient.request<
        ChangePasswordMutation,
        ChangePasswordMutationVariables
      >(CHANGE_PASSWORD_MUTATION, { input }),

    meta: { successMessage: 'Senha alterada com sucesso' },
  })
}
