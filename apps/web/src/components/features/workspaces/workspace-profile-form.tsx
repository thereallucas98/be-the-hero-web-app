'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { PhoneInput } from '~/components/ui/masked-input'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  description: z.string().min(10, 'Mínimo 10 caracteres'),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  emailPublic: z.union([z.email('Email inválido'), z.literal('')]).optional(),
  website: z.union([z.string().url('URL inválida'), z.literal('')]).optional(),
  instagram: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WorkspaceProfileFormProps {
  workspaceId: string
  defaultValues: FormValues
}

// ─── Shared input class ───────────────────────────────────────────────────────

const inputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-3 text-[16px] font-semibold',
  'placeholder:text-[#8fa7b2] placeholder:font-normal',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-nunito text-accent-navy text-[14px] font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p className="font-nunito text-brand-primary text-[13px] font-semibold">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspaceProfileForm({
  workspaceId,
  defaultValues,
}: WorkspaceProfileFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  async function onSubmit(values: FormValues) {
    const body: Record<string, string> = {}
    if (values.name) body.name = values.name
    if (values.description) body.description = values.description
    if (values.phone !== undefined) body.phone = values.phone
    if (values.whatsapp !== undefined) body.whatsapp = values.whatsapp
    if (values.emailPublic !== undefined) body.emailPublic = values.emailPublic
    if (values.website !== undefined) body.website = values.website
    if (values.instagram !== undefined) body.instagram = values.instagram

    const res = await fetch(`/api/workspaces/${workspaceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      toast.error('Erro ao salvar. Tente novamente.')
      return
    }

    toast.success('Perfil atualizado!')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <Field label="Nome da organização" error={errors.name?.message}>
        <input
          {...register('name')}
          type="text"
          className={cn(inputCls, errors.name && 'border-brand-primary')}
        />
      </Field>

      <Field label="Descrição" error={errors.description?.message}>
        <textarea
          {...register('description')}
          rows={4}
          className={cn(
            inputCls,
            'resize-none',
            errors.description && 'border-brand-primary',
          )}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Telefone" error={errors.phone?.message}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ''}
                onChange={field.onChange}
                className={cn(inputCls, errors.phone && 'border-brand-primary')}
              />
            )}
          />
        </Field>

        <Field label="WhatsApp" error={errors.whatsapp?.message}>
          <Controller
            name="whatsapp"
            control={control}
            render={({ field }) => (
              <PhoneInput
                value={field.value ?? ''}
                onChange={field.onChange}
                className={cn(
                  inputCls,
                  errors.whatsapp && 'border-brand-primary',
                )}
              />
            )}
          />
        </Field>
      </div>

      <Field label="Email público" error={errors.emailPublic?.message}>
        <input
          {...register('emailPublic')}
          type="email"
          placeholder="contato@org.com"
          className={cn(inputCls, errors.emailPublic && 'border-brand-primary')}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Website" error={errors.website?.message}>
          <input
            {...register('website')}
            type="url"
            placeholder="https://..."
            className={cn(inputCls, errors.website && 'border-brand-primary')}
          />
        </Field>

        <Field label="Instagram" error={errors.instagram?.message}>
          <input
            {...register('instagram')}
            type="text"
            placeholder="@minha_org"
            className={cn(inputCls, errors.instagram && 'border-brand-primary')}
          />
        </Field>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="font-nunito bg-accent-navy flex h-[48px] cursor-pointer items-center justify-center rounded-[14px] px-8 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
