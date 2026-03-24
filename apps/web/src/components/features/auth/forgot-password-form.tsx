'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AuthField, authInputCls } from '~/components/features/auth/auth-field'
import { cn } from '~/lib/utils'

// ─── Schema ───────────────────────────────────────────────────────────────────

const schema = z.object({
  email: z.email({ message: 'Email inválido' }),
})

type FormValues = z.infer<typeof schema>

// ─── Component ────────────────────────────────────────────────────────────────

export function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  async function onSubmit(values: FormValues) {
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    // Always show success — no email enumeration
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div
        data-slot="forgot-password-form"
        className="flex flex-col items-center gap-5 text-center"
      >
        <CheckCircle className="size-12 text-green-500" aria-hidden />
        <div>
          <p className="font-nunito text-accent-navy text-[18px] font-bold">
            Verifique seu email
          </p>
          <p className="font-nunito text-accent-navy/60 mt-2 text-[15px] leading-relaxed">
            Se este email estiver cadastrado, você receberá um link em breve.
          </p>
        </div>
        <Link
          href="/login"
          className="font-nunito text-accent-navy/60 hover:text-accent-navy text-[14px] font-semibold underline underline-offset-2 transition-colors focus-visible:outline-none"
        >
          Voltar ao login
        </Link>
      </div>
    )
  }

  return (
    <form
      data-slot="forgot-password-form"
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-5"
      noValidate
    >
      <p className="font-nunito text-accent-navy/60 text-[15px] leading-relaxed">
        Informe seu email e enviaremos um link para redefinir sua senha.
      </p>

      <AuthField label="Email" error={errors.email?.message}>
        <input
          {...register('email')}
          type="email"
          placeholder="nome@email.com"
          autoComplete="email"
          className={cn(authInputCls, errors.email && 'border-brand-primary')}
        />
      </AuthField>

      <div className="mt-2 flex flex-col gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="font-nunito bg-accent-navy flex h-[64px] w-full cursor-pointer items-center justify-center rounded-[20px] text-[18px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-60"
        >
          {isSubmitting ? 'Enviando…' : 'Enviar link'}
        </button>

        <Link
          href="/login"
          className="font-nunito text-accent-navy focus-visible:ring-accent-navy flex h-[64px] w-full items-center justify-center rounded-[20px] text-[18px] font-extrabold underline underline-offset-2 transition-opacity hover:opacity-70 focus-visible:ring-2 focus-visible:outline-none"
        >
          Voltar ao login
        </Link>
      </div>
    </form>
  )
}
