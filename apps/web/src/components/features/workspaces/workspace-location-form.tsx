'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from 'sonner'
import { z } from 'zod'
import { CepInput } from '~/components/ui/masked-input'
import { formatAddress } from '~/lib/format-address'
import { lookupCep, normalizeCityName } from '~/lib/via-cep'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  cityPlaceId: z.string().min(1, 'Selecione a cidade'),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  zipCode: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WorkspaceLocationFormProps {
  workspaceId: string
  defaultValues: FormValues
  lat: number
  lng: number
}

interface CityOption {
  id: string
  name: string
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
  hint,
  error,
  children,
}: {
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline gap-2">
        <label className="font-nunito text-accent-navy text-[14px] font-semibold">
          {label}
        </label>
        {hint && (
          <span className="font-nunito text-[12px] text-[#8fa7b2]">{hint}</span>
        )}
      </div>
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

export function WorkspaceLocationForm({
  workspaceId,
  defaultValues,
  lat,
  lng,
}: WorkspaceLocationFormProps) {
  const router = useRouter()
  const [cities, setCities] = useState<CityOption[]>([])
  const [cepLoading, setCepLoading] = useState(false)
  const lastLookedUp = useRef('')

  useEffect(() => {
    fetch('/api/geo/cities')
      .then((r) => r.json())
      .then((data: CityOption[]) => setCities(data))
      .catch(() => null)
  }, [])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })

  const zipCodeValue = watch('zipCode') ?? ''

  // ── ViaCEP lookup ──────────────────────────────────────────────────────────
  async function handleCepLookup(raw: string) {
    if (raw.length !== 8 || raw === lastLookedUp.current) return
    lastLookedUp.current = raw

    setCepLoading(true)
    const result = await lookupCep(raw)
    setCepLoading(false)

    if (!result.success) {
      if (result.code === 'NOT_FOUND') toast.error('CEP não encontrado.')
      else if (result.code === 'NETWORK_ERROR')
        toast.error('Erro ao buscar CEP.')
      return
    }

    const { data } = result
    if (data.addressLine)
      setValue('street', data.addressLine, { shouldDirty: true })
    if (data.neighborhood)
      setValue('neighborhood', data.neighborhood, { shouldDirty: true })

    if (data.city && cities.length > 0) {
      const normalized = normalizeCityName(data.city)
      const match = cities.find((c) => normalizeCityName(c.name) === normalized)
      if (match) setValue('cityPlaceId', match.id, { shouldDirty: true })
    }
  }

  async function onSubmit(values: FormValues) {
    const addressLine = formatAddress({
      street: values.street,
      number: values.number,
      complement: values.complement,
    })

    const res = await fetch(`/api/workspaces/${workspaceId}/location`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cityPlaceId: values.cityPlaceId,
        lat,
        lng,
        addressLine: addressLine || undefined,
        neighborhood: values.neighborhood || undefined,
        zipCode: values.zipCode || undefined,
      }),
    })

    if (!res.ok) {
      toast.error('Erro ao salvar localização. Tente novamente.')
      return
    }

    toast.success('Localização atualizada!')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* ── CEP first — drives autocomplete ───────────────────────── */}
      <Field
        label="CEP"
        hint="Preencha para autocompletar"
        error={errors.zipCode?.message}
      >
        <div className="relative">
          <CepInput
            value={zipCodeValue}
            onChange={(raw) => {
              setValue('zipCode', raw, { shouldDirty: true })
              handleCepLookup(raw).catch(() => null)
            }}
            className={cn(
              inputCls,
              'pr-10',
              errors.zipCode && 'border-brand-primary',
            )}
          />
          {cepLoading && (
            <Loader
              className="text-accent-navy/40 absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin"
              aria-hidden
            />
          )}
        </div>
      </Field>

      <Field label="Cidade" error={errors.cityPlaceId?.message}>
        <Controller
          name="cityPlaceId"
          control={control}
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                className={cn(
                  inputCls,
                  'h-auto cursor-pointer',
                  errors.cityPlaceId && 'border-brand-primary',
                )}
              >
                <SelectValue placeholder="Selecione a cidade" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Rua / Logradouro" error={errors.street?.message}>
        <input
          {...register('street')}
          type="text"
          placeholder="Rua das Flores"
          className={cn(inputCls, errors.street && 'border-brand-primary')}
        />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Número" error={errors.number?.message}>
          <input
            {...register('number')}
            type="text"
            placeholder="123"
            className={cn(inputCls, errors.number && 'border-brand-primary')}
          />
        </Field>

        <Field
          label="Complemento"
          hint="Opcional"
          error={errors.complement?.message}
        >
          <input
            {...register('complement')}
            type="text"
            placeholder="Apto 42"
            className={cn(
              inputCls,
              errors.complement && 'border-brand-primary',
            )}
          />
        </Field>
      </div>

      <Field label="Bairro" error={errors.neighborhood?.message}>
        <input
          {...register('neighborhood')}
          type="text"
          placeholder="Centro"
          className={cn(
            inputCls,
            errors.neighborhood && 'border-brand-primary',
          )}
        />
      </Field>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isDirty}
          className="font-nunito bg-accent-navy flex h-[48px] cursor-pointer items-center justify-center rounded-[14px] px-8 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando…' : 'Salvar localização'}
        </button>
      </div>
    </form>
  )
}
