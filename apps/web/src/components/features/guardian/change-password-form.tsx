'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useChangePassword } from '~/graphql/hooks/use-change-password'

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe a senha atual'),
    newPassword: z.string().min(8, 'Nova senha deve ter ao menos 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirme a nova senha'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ChangePasswordValues = z.infer<typeof changePasswordSchema>

export function ChangePasswordForm() {
  const changePassword = useChangePassword()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: ChangePasswordValues) {
    changePassword.mutate(
      {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      },
      {
        onSuccess: () => {
          reset()
        },
        onError: (error) => {
          const message = (error as Error).message
          if (message.includes('Senha atual incorreta')) {
            setError('currentPassword', { message: 'Senha atual incorreta' })
          } else {
            setError('root', { message })
          }
        },
      },
    )
  }

  return (
    <form
      data-slot="change-password-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="currentPassword">Senha atual</Label>
        <Input
          id="currentPassword"
          type="password"
          {...register('currentPassword')}
        />
        {errors.currentPassword && (
          <p className="text-destructive text-xs">
            {errors.currentPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="newPassword">Nova senha</Label>
        <Input id="newPassword" type="password" {...register('newPassword')} />
        {errors.newPassword && (
          <p className="text-destructive text-xs">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          {...register('confirmPassword')}
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-xs">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      {errors.root && (
        <p className="text-destructive text-xs">{errors.root.message}</p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting || changePassword.isPending}
        className="self-start"
      >
        {changePassword.isPending ? 'Alterando...' : 'Alterar senha'}
      </Button>
    </form>
  )
}
