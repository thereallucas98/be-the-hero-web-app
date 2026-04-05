import { GraphQLError } from 'graphql'

import { listMyInterests } from '~/server/use-cases'
import { builder } from '../builder'
import { InterestPageType } from '../types/interest.type'

builder.queryField('myInterests', (t) =>
  t.field({
    type: InterestPageType,
    args: {
      page: t.arg.int({ defaultValue: 1 }),
      perPage: t.arg.int({ defaultValue: 10 }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.principal) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const result = await listMyInterests(
        ctx.repos.interestRepo,
        ctx.principal,
        { page: args.page ?? 1, perPage: args.perPage ?? 10 },
      )

      if (!result.success) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: result.code },
        })
      }

      return result
    },
  }),
)
