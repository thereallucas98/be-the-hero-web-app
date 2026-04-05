'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { graphqlClient } from '~/lib/graphql-client'
import type {
  WithdrawInterestMutation,
  WithdrawInterestMutationVariables,
  MyInterestsQuery,
} from '~/generated/graphql'

const WITHDRAW_INTEREST_MUTATION = /* GraphQL */ `
  mutation WithdrawInterest($interestId: ID!) {
    withdrawInterest(interestId: $interestId)
  }
`

export function useWithdrawInterest() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (interestId: string) =>
      graphqlClient.request<
        WithdrawInterestMutation,
        WithdrawInterestMutationVariables
      >(WITHDRAW_INTEREST_MUTATION, { interestId }),

    onMutate: async (interestId) => {
      await queryClient.cancelQueries({ queryKey: ['myInterests'] })

      const previousQueries = queryClient.getQueriesData<MyInterestsQuery>({
        queryKey: ['myInterests'],
      })

      queryClient.setQueriesData<MyInterestsQuery>(
        { queryKey: ['myInterests'] },
        (old) => {
          if (!old?.myInterests?.items) return old
          return {
            ...old,
            myInterests: {
              ...old.myInterests,
              items: old.myInterests.items.filter(
                (item) => item.id !== interestId,
              ),
              total: (old.myInterests.total ?? 1) - 1,
            },
          }
        },
      )

      return { previousQueries }
    },

    onError: (_err, _interestId, context) => {
      if (context?.previousQueries) {
        for (const [key, data] of context.previousQueries) {
          queryClient.setQueryData(key, data)
        }
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['myInterests'] })
    },

    meta: { successMessage: 'Interesse retirado com sucesso' },
  })
}
