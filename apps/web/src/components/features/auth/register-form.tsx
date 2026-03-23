'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: 'Nome obrigatório' }),
    email: z.email({ message: 'Email inválido' }),
    whatsapp: z.string().optional(),
    password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

// ─── Field wrapper ────────────────────────────────────────────────────────────

function AuthField({
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
      <label className="font-nunito text-accent-navy text-[15px] font-semibold">
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

// ─── Input base class ─────────────────────────────────────────────────────────

const authInputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-4 text-[16px] font-semibold placeholder:text-accent-navy/30',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

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

// ─── Component ────────────────────────────────────────────────────────────────

export function RegisterForm() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      whatsapp: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(values: RegisterFormValues) {
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
        body?.message === 'EMAIL_IN_USE'
          ? 'Este email já está em uso'
          : 'Erro ao criar conta. Tente novamente.'
      setError('root', { message: msg })
      return
    }

    router.push('/login')
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
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

      <AuthField label="Whatsapp" error={errors.whatsapp?.message}>
        <input
          {...register('whatsapp')}
          type="tel"
          placeholder="81 91234.5678"
          autoComplete="tel"
          className={authInputCls}
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
          {isSubmitting ? 'Cadastrando…' : 'Cadastrar'}
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
