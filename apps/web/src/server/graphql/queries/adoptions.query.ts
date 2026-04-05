import { GraphQLError } from 'graphql'

import { getAdoptionById, listGuardianAdoptions } from '~/server/use-cases'
import { builder } from '../builder'
import {
  AdoptionDetailType,
  GuardianAdoptionPageType,
} from '../types/adoption.type'

builder.queryField('myAdoptions', (t) =>
  t.field({
    type: GuardianAdoptionPageType,
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

      const result = await listGuardianAdoptions(
        ctx.repos.followUpRepo,
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

builder.queryField('adoption', (t) =>
  t.field({
    type: AdoptionDetailType,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.principal) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const result = await getAdoptionById(
        ctx.repos.adoptionRepo,
        ctx.principal,
        { adoptionId: String(args.id) },
      )

      if (!result.success) {
        const messages: Record<string, string> = {
          UNAUTHENTICATED: 'Não autenticado',
          NOT_FOUND: 'Adoção não encontrada',
          FORBIDDEN: 'Acesso negado',
        }
        throw new GraphQLError(messages[result.code] ?? result.code, {
          extensions: { code: result.code },
        })
      }

      return result.adoption
    },
  }),
)
