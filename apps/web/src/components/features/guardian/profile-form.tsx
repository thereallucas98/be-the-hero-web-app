'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { useUpdateMe } from '~/graphql/hooks/use-update-me'

const profileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  phone: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  defaultValues: {
    fullName: string
    phone?: string
  }
}

export function ProfileForm({ defaultValues }: ProfileFormProps) {
  const updateMe = useUpdateMe()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: defaultValues.fullName,
      phone: defaultValues.phone ?? '',
    },
  })

  async function onSubmit(values: ProfileFormValues) {
    updateMe.mutate({
      fullName: values.fullName,
      phone: values.phone || null,
    })
  }

  return (
    <form
      data-slot="profile-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="fullName">Nome completo</Label>
        <Input id="fullName" {...register('fullName')} />
        {errors.fullName && (
          <p className="text-destructive text-xs">{errors.fullName.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          {...register('phone')}
          placeholder="(00) 00000-0000"
        />
        {errors.phone && (
          <p className="text-destructive text-xs">{errors.phone.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting || updateMe.isPending}
        className="self-start"
      >
        {updateMe.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </form>
  )
}
