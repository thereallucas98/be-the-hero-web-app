import { GraphQLError } from 'graphql'

import { withdrawAdoptionInterest } from '~/server/use-cases'
import { builder } from '../builder'

builder.mutationField('withdrawInterest', (t) =>
  t.boolean({
    args: {
      interestId: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.principal) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const result = await withdrawAdoptionInterest(
        ctx.repos.interestRepo,
        ctx.principal,
        { interestId: String(args.interestId) },
      )

      if (!result.success) {
        const messages: Record<string, string> = {
          UNAUTHENTICATED: 'Não autenticado',
          NOT_FOUND: 'Interesse não encontrado',
          FORBIDDEN: 'Acesso negado',
        }
        throw new GraphQLError(messages[result.code] ?? result.code, {
          extensions: { code: result.code },
        })
      }

      return true
    },
  }),
)
