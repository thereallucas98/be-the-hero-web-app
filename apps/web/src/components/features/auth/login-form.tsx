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

const loginSchema = z.object({
  email: z.email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

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

// ─── Input styling ────────────────────────────────────────────────────────────

const authInputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-4 text-[16px] font-semibold placeholder:text-accent-navy/30',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  async function onSubmit(values: LoginFormValues) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      setError('root', { message: 'Email ou senha inválidos' })
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
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
        <div className="relative">
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            autoComplete="current-password"
            className={cn(
              authInputCls,
              'pr-12',
              errors.password && 'border-brand-primary',
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            className="text-accent-navy/40 hover:text-accent-navy absolute top-1/2 right-4 -translate-y-1/2 focus-visible:outline-none"
          >
            {showPassword ? (
              <Eye className="size-5" aria-hidden />
            ) : (
              <EyeOff className="size-5" aria-hidden />
            )}
          </button>
        </div>
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
          {isSubmitting ? 'Entrando…' : 'Login'}
        </button>

        <Link
          href="/register"
          className="font-nunito bg-accent-navy/5 text-accent-navy focus-visible:ring-accent-navy flex h-[64px] w-full items-center justify-center rounded-[20px] text-[18px] font-extrabold transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
        >
          Cadastrar minha organização
        </Link>
      </div>
    </form>
  )
}
