import { Suspense } from 'react'
import { AuthIllustrationPanel } from '~/components/features/auth/auth-illustration-panel'
import { VerifyEmailView } from '~/components/features/auth/verify-email-view'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-dvh bg-white">
      {/* ── Left illustration panel (desktop only) ─────────────────────── */}
      <div className="hidden w-[420px] shrink-0 p-6 lg:block xl:w-[500px]">
        <AuthIllustrationPanel />
      </div>

      {/* ── Right: content ────────────────────────────────────────────── */}
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
          <Suspense>
            <VerifyEmailView />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
