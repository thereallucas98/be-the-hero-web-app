import { Suspense } from 'react'
import { AuthIllustrationPanel } from '~/components/features/auth/auth-illustration-panel'
import { ResetPasswordPageClient } from '~/components/features/auth/reset-password-form'

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-dvh bg-white">
      {/* ── Left illustration panel (desktop only) ─────────────────────── */}
      <div className="hidden w-[420px] shrink-0 p-6 lg:block xl:w-[500px]">
        <AuthIllustrationPanel />
      </div>

      {/* ── Right: form ───────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 sm:px-10 lg:px-16 xl:px-20">
        {/* Mobile brand strip */}
        <div className="mb-8 lg:hidden">
          <div className="bg-brand-primary inline-flex items-center gap-2 rounded-[14px] px-4 py-3">
            <span className="font-nunito text-[15px] font-extrabold text-white">
              BeTheHero
            </span>
          </div>
        </div>

        <div className="w-full max-w-[488px]">
          <h1 className="font-nunito text-accent-navy mb-8 text-[42px] leading-none font-bold tracking-tight sm:text-[54px]">
            Nova senha
          </h1>
          <Suspense>
            <ResetPasswordPageClient />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
