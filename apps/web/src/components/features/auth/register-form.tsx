'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthField, authInputCls } from '~/components/features/auth/auth-field'
import { PhoneInput } from '~/components/ui/masked-input'
import { cn } from '~/lib/utils'

// ─── Schemas ──────────────────────────────────────────────────────────────────

const step1Schema = z
  .object({
    fullName: z.string().min(2, { message: 'Nome obrigatório' }),
    email: z.email({ message: 'Email inválido' }),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

const step2Schema = z.object({
  name: z.string().min(3, { message: 'Nome obrigatório (mín. 3 caracteres)' }),
  type: z.enum(['ONG', 'CLINIC', 'PETSHOP', 'INDEPENDENT'], {
    message: 'Selecione o tipo',
  }),
  description: z
    .string()
    .min(10, { message: 'Descrição obrigatória (mín. 10 caracteres)' }),
  cityPlaceId: z.string().min(1, { message: 'Selecione a cidade' }),
  phone: z.string().optional(),
})

type Step1Values = z.infer<typeof step1Schema>
type Step2Values = z.infer<typeof step2Schema>

interface CityOption {
  id: string
  name: string
}

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordInput({
  hasError,
  placeholder,
  autoComplete,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? '••••••••••••'}
        autoComplete={autoComplete}
        className={cn(
          authInputCls,
          'pr-12',
          hasError && 'border-brand-primary',
        )}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Ocultar senha' : 'Mostrar senha'}
        className="text-accent-navy/40 hover:text-accent-navy absolute top-1/2 right-4 -translate-y-1/2 focus-visible:outline-none"
      >
        {show ? (
          <Eye className="size-5" aria-hidden />
        ) : (
          <EyeOff className="size-5" aria-hidden />
        )}
      </button>
    </div>
  )
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <p className="font-nunito text-accent-navy/50 mb-2 text-[13px] font-semibold">
      {step === 1 ? '1 de 2 — Dados pessoais' : '2 de 2 — Sua organização'}
    </p>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [cities, setCities] = useState<CityOption[]>([])

  useEffect(() => {
    fetch('/api/geo/cities')
      .then((r) => r.json())
      .then((data: CityOption[]) => setCities(data))
      .catch(() => null)
  }, [])

  // ── Step 1 form ──
  const form1 = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  // ── Step 2 form ──
  const form2 = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      name: '',
      type: undefined,
      description: '',
      cityPlaceId: '',
      phone: '',
    },
  })

  // ── Step 1 submit ──
  async function onStep1Submit(values: Step1Values) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        role: 'PARTNER_MEMBER',
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      const msg =
        res.status === 409
          ? 'Este email já está em uso'
          : (body?.message ?? 'Erro ao criar conta. Tente novamente.')
      form1.setError('root', { message: msg })
      return
    }

    setStep(2)
  }

  // ── Step 2 submit ──
  async function onStep2Submit(values: Step2Values) {
    const res = await fetch('/api/workspaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: values.name,
        type: values.type,
        description: values.description,
        cityPlaceId: values.cityPlaceId,
        phone: values.phone || undefined,
        lat: 0,
        lng: 0,
      }),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      form2.setError('root', {
        message: body?.message ?? 'Erro ao criar organização.',
      })
      return
    }

    const data = (await res.json()) as { workspace: { id: string } }
    router.push(`/workspaces/${data.workspace.id}/pets`)
    router.refresh()
  }

  // ── Shared select class ──
  const selectCls = cn(authInputCls, 'cursor-pointer appearance-none')

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  if (step === 1) {
    const {
      register,
      handleSubmit,
      formState: { errors, isSubmitting },
    } = form1

    return (
      <form
        onSubmit={handleSubmit(onStep1Submit)}
        className="flex flex-col gap-5"
        noValidate
      >
        <StepIndicator step={1} />

        <AuthField label="Nome do responsável" error={errors.fullName?.message}>
          <input
            {...register('fullName')}
            type="text"
            placeholder="Antônio Bandeira"
            autoComplete="name"
            className={cn(
              authInputCls,
              errors.fullName && 'border-brand-primary',
            )}
          />
        </AuthField>

        <AuthField label="Email" error={errors.email?.message}>
          <input
            {...register('email')}
            type="email"
            placeholder="nome@email.com"
            autoComplete="email"
            className={cn(authInputCls, errors.email && 'border-brand-primary')}
          />
        </AuthField>

        <AuthField label="Senha" error={errors.password?.message}>
          <PasswordInput
            {...register('password')}
            autoComplete="new-password"
            hasError={!!errors.password}
          />
        </AuthField>

        <AuthField
          label="Confirmar Senha"
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...register('confirmPassword')}
            autoComplete="new-password"
            hasError={!!errors.confirmPassword}
          />
        </AuthField>

        {errors.root && (
          <p className="font-nunito text-brand-primary text-center text-[14px] font-semibold">
            {errors.root.message}
          </p>
        )}

        <div className="mt-2 flex flex-col gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-nunito bg-accent-navy flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60"
          >
            {isSubmitting ? 'Aguarde…' : 'Continuar'}
          </button>

          <Link
            href="/login"
            className="font-nunito text-accent-navy focus-visible:ring-accent-navy flex h-[64px] w-full items-center justify-center rounded-[20px] text-[18px] font-extrabold underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
          >
            Já possui conta?
          </Link>
        </div>
      </form>
    )
  }

  // ── Step 2 ──────────────────────────────────────────────────────────────────
  const {
    register: reg2,
    handleSubmit: submit2,
    control: ctrl2,
    formState: { errors: err2, isSubmitting: submitting2 },
  } = form2

  return (
    <form
      onSubmit={submit2(onStep2Submit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <StepIndicator step={2} />

      <AuthField label="Nome da organização" error={err2.name?.message}>
        <input
          {...reg2('name')}
          type="text"
          placeholder="ONG Patinhas Felizes"
          autoComplete="organization"
          className={cn(authInputCls, err2.name && 'border-brand-primary')}
        />
      </AuthField>

      <AuthField label="Tipo" error={err2.type?.message}>
        <select
          {...reg2('type')}
          className={cn(selectCls, err2.type && 'border-brand-primary')}
        >
          <option value="">Selecione o tipo</option>
          <option value="ONG">ONG</option>
          <option value="CLINIC">Clínica veterinária</option>
          <option value="PETSHOP">Petshop</option>
          <option value="INDEPENDENT">Independente</option>
        </select>
      </AuthField>

      <AuthField label="Descrição" error={err2.description?.message}>
        <textarea
          {...reg2('description')}
          placeholder="Conte um pouco sobre a sua organização…"
          rows={3}
          className={cn(
            authInputCls,
            'h-auto resize-none py-3',
            err2.description && 'border-brand-primary',
          )}
        />
      </AuthField>

      <AuthField label="Cidade" error={err2.cityPlaceId?.message}>
        <select
          {...reg2('cityPlaceId')}
          className={cn(selectCls, err2.cityPlaceId && 'border-brand-primary')}
        >
          <option value="">Selecione a cidade</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </AuthField>

      <AuthField label="Telefone (opcional)" error={err2.phone?.message}>
        <Controller
          name="phone"
          control={ctrl2}
          render={({ field }) => (
            <PhoneInput
              value={field.value ?? ''}
              onChange={field.onChange}
              className={cn(authInputCls, err2.phone && 'border-brand-primary')}
            />
          )}
        />
      </AuthField>

      {err2.root && (
        <p className="font-nunito text-brand-primary text-center text-[14px] font-semibold">
          {err2.root.message}
        </p>
      )}

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="submit"
          disabled={submitting2}
          className="font-nunito bg-accent-navy flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60"
        >
          {submitting2 ? 'Criando organização…' : 'Criar organização'}
        </button>

        <button
          type="button"
          onClick={() => setStep(1)}
          className="font-nunito text-accent-navy focus-visible:ring-accent-navy flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
        >
          Voltar
        </button>
      </div>
    </form>
  )
}
