import { GraphQLError } from 'graphql'

import { changePassword, updateMe } from '~/server/use-cases'
import { builder } from '../builder'
import { UserType } from '../types/user.type'

const UpdateMeInput = builder.inputType('UpdateMeInput', {
  fields: (t) => ({
    fullName: t.string(),
    phone: t.string(),
  }),
})

const ChangePasswordInput = builder.inputType('ChangePasswordInput', {
  fields: (t) => ({
    currentPassword: t.string({ required: true }),
    newPassword: t.string({ required: true }),
  }),
})

builder.mutationField('updateMe', (t) =>
  t.field({
    type: UserType,
    args: {
      input: t.arg({ type: UpdateMeInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.principal) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const result = await updateMe(ctx.repos.userRepo, {
        userId: ctx.principal.userId,
        fullName: args.input.fullName ?? undefined,
        phone: args.input.phone ?? undefined,
      })

      return {
        id: ctx.principal.userId,
        fullName: result.data.fullName,
        email: ctx.principal.email,
        role: ctx.principal.role,
        emailVerified: true,
      }
    },
  }),
)

builder.mutationField('changePassword', (t) =>
  t.boolean({
    args: {
      input: t.arg({ type: ChangePasswordInput, required: true }),
    },
    resolve: async (_root, args, ctx) => {
      if (!ctx.principal) {
        throw new GraphQLError('Não autenticado', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const result = await changePassword(ctx.repos.userRepo, {
        userId: ctx.principal.userId,
        email: ctx.principal.email,
        currentPassword: args.input.currentPassword,
        newPassword: args.input.newPassword,
      })

      if (!result.success) {
        throw new GraphQLError('Senha atual incorreta', {
          extensions: { code: result.code },
        })
      }

      return true
    },
  }),
)
