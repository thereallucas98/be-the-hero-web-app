'use client'

import { CheckCircle, Loader, Mail, XCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

// ─── Types ────────────────────────────────────────────────────────────────────

type State = 'loading' | 'success' | 'error' | 'pending'

// ─── Component ────────────────────────────────────────────────────────────────

export function VerifyEmailView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [state, setState] = useState<State>(token ? 'loading' : 'pending')
  const [cooldown, setCooldown] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const verifiedRef = useRef(false)

  // ── Auto-verify on mount when token is present ──
  useEffect(() => {
    if (!token || verifiedRef.current) return
    verifiedRef.current = true

    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (res.ok) {
          setState('success')
          setTimeout(() => router.push('/'), 2000)
        } else {
          setState('error')
        }
      })
      .catch(() => setState('error'))
  }, [token, router])

  // ── Cooldown timer ──
  useEffect(() => {
    if (cooldown <= 0) return
    timerRef.current = setInterval(() => {
      setCooldown((v) => {
        if (v <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return v - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current!)
  }, [cooldown])

  async function handleResend() {
    const res = await fetch('/api/auth/resend-verification', { method: 'POST' })
    if (res.ok) {
      toast.success('Email reenviado! Verifique sua caixa de entrada.')
      setCooldown(60)
    } else {
      toast.error('Não foi possível reenviar. Tente novamente.')
    }
  }

  // ── Loading ──
  if (state === 'loading') {
    return (
      <div
        data-slot="verify-email-view"
        className="flex flex-col items-center gap-4 text-center"
      >
        <Loader className="text-accent-navy size-12 animate-spin" aria-hidden />
        <p className="font-nunito text-accent-navy text-[18px] font-bold">
          Verificando…
        </p>
      </div>
    )
  }

  // ── Success ──
  if (state === 'success') {
    return (
      <div
        data-slot="verify-email-view"
        className="flex flex-col items-center gap-4 text-center"
      >
        <CheckCircle className="size-12 text-green-500" aria-hidden />
        <p className="font-nunito text-accent-navy text-[18px] font-bold">
          Email verificado!
        </p>
        <p className="font-nunito text-accent-navy/60 text-[15px]">
          Redirecionando…
        </p>
      </div>
    )
  }

  // ── Error (invalid/expired token) ──
  if (state === 'error') {
    return (
      <div
        data-slot="verify-email-view"
        className="flex flex-col items-center gap-5 text-center"
      >
        <XCircle className="text-brand-primary size-12" aria-hidden />
        <div>
          <p className="font-nunito text-accent-navy text-[18px] font-bold">
            Link inválido ou expirado.
          </p>
          <p className="font-nunito text-accent-navy/60 mt-1 text-[14px]">
            Solicite um novo link de verificação abaixo.
          </p>
        </div>
        <ResendButton cooldown={cooldown} onResend={handleResend} />
      </div>
    )
  }

  // ── Pending (no token — just registered) ──
  return (
    <div
      data-slot="verify-email-view"
      className="flex flex-col items-center gap-5 text-center"
    >
      <div className="bg-accent-navy/10 flex size-16 items-center justify-center rounded-full">
        <Mail className="text-accent-navy size-8" aria-hidden />
      </div>
      <div>
        <p className="font-nunito text-accent-navy text-[18px] font-bold">
          Verifique seu email
        </p>
        <p className="font-nunito text-accent-navy/60 mt-2 text-[14px] leading-relaxed">
          Enviamos um link de confirmação para o seu email.
          <br />
          Clique no link para ativar sua conta.
        </p>
      </div>
      <ResendButton cooldown={cooldown} onResend={handleResend} />
    </div>
  )
}

// ─── Resend button ────────────────────────────────────────────────────────────

function ResendButton({
  cooldown,
  onResend,
}: {
  cooldown: number
  onResend: () => void
}) {
  return (
    <button
      type="button"
      onClick={onResend}
      disabled={cooldown > 0}
      className="font-nunito bg-accent-navy flex h-[56px] w-full max-w-[320px] cursor-pointer items-center justify-center rounded-[20px] text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
    >
      {cooldown > 0 ? `Reenviar em ${cooldown}s` : 'Reenviar email'}
    </button>
  )
}
