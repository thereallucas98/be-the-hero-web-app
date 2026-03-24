'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthField, authInputCls } from '~/components/features/auth/auth-field'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z
  .object({
    newPassword: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
    confirmPassword: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'Senhas não conferem',
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

// ─── Password field ───────────────────────────────────────────────────────────

function PasswordInput({
  hasError,
  autoComplete,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { hasError?: boolean }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        {...props}
        type={show ? 'text' : 'password'}
        placeholder="••••••••••••"
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

// ─── Props ────────────────────────────────────────────────────────────────────

interface ResetPasswordFormProps {
  token: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter()
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  })

  async function onSubmit(values: FormValues) {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword: values.newPassword }),
    })

    if (!res.ok) {
      setError('root', {
        message: 'Link inválido ou expirado. Solicite um novo.',
      })
      return
    }

    setDone(true)
    setTimeout(() => router.push('/login'), 2000)
  }

  if (done) {
    return (
      <div
        data-slot="reset-password-form"
        className="flex flex-col items-center gap-5 text-center"
      >
        <CheckCircle className="size-12 text-green-500" aria-hidden />
        <div>
          <p className="font-nunito text-accent-navy text-[18px] font-bold">
            Senha alterada!
          </p>
          <p className="font-nunito text-accent-navy/60 mt-1 text-[14px]">
            Redirecionando para o login…
          </p>
        </div>
      </div>
    )
  }

  return (
    <form
      data-slot="reset-password-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <AuthField label="Nova senha" error={errors.newPassword?.message}>
        <PasswordInput
          {...register('newPassword')}
          autoComplete="new-password"
          hasError={!!errors.newPassword}
        />
      </AuthField>

      <AuthField
        label="Confirmar senha"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          {...register('confirmPassword')}
          autoComplete="new-password"
          hasError={!!errors.confirmPassword}
        />
      </AuthField>

      {errors.root && (
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-nunito text-brand-primary text-[14px] font-semibold">
            {errors.root.message}
          </p>
          <Link
            href="/forgot-password"
            className="font-nunito text-accent-navy/60 hover:text-accent-navy text-[13px] font-semibold underline underline-offset-2 transition-colors focus-visible:outline-none"
          >
            Solicitar novo link
          </Link>
        </div>
      )}

      <div className="mt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-nunito bg-accent-navy flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60"
        >
          {isSubmitting ? 'Salvando…' : 'Salvar nova senha'}
        </button>
      </div>
    </form>
  )
}

// ─── Page client wrapper ──────────────────────────────────────────────────────

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  if (!token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="font-nunito text-brand-primary text-[16px] font-semibold">
          Link inválido. Solicite um novo.
        </p>
        <Link
          href="/forgot-password"
          className="font-nunito text-accent-navy underline underline-offset-2 focus-visible:outline-none"
        >
          Esqueci a senha
        </Link>
      </div>
    )
  }

  return <ResetPasswordForm token={token} />
}
