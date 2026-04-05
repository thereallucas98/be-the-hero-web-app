'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthField, authInputCls } from '~/components/features/auth/auth-field'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.email({ message: 'Email inválido' }),
  password: z.string().min(8, { message: 'Mínimo 8 caracteres' }),
})

type LoginFormValues = z.infer<typeof loginSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo')
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

    const { user } = await res.json()

    if (redirectTo) {
      router.push(redirectTo)
    } else if (user.role === 'PARTNER_MEMBER' && user.workspaceId) {
      router.push(`/workspaces/${user.workspaceId}/pets`)
    } else {
      router.push('/')
    }

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
        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="font-nunito text-accent-navy/60 hover:text-accent-navy text-[13px] font-semibold underline underline-offset-2 transition-colors focus-visible:outline-none"
          >
            Esqueceu a senha?
          </Link>
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

        <Link
          href="/register/guardian"
          className="font-nunito text-accent-navy/60 hover:text-accent-navy text-center text-[14px] font-semibold underline underline-offset-2 transition-colors focus-visible:outline-none"
        >
          É adotante? Cadastre-se aqui
        </Link>
      </div>
    </form>
  )
}
