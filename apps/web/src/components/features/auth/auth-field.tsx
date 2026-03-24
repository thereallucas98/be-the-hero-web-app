import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

// ─── Shared input class ────────────────────────────────────────────────────────

export const authInputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-4 text-[16px] font-semibold placeholder:text-accent-navy/30',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

// ─── AuthField ─────────────────────────────────────────────────────────────────

interface AuthFieldProps {
  label: string
  error?: string
  children: ReactNode
}

export function AuthField({ label, error, children }: AuthFieldProps) {
  return (
    <div data-slot="auth-field" className="flex flex-col gap-1.5">
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
