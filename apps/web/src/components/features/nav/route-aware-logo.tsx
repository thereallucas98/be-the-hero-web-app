'use client'

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Logo, LogoIcon } from '~/components/ui/logo'

/** Hidden on /pets* — the sidebar already carries the logo on that route. */
export function HeaderLogo() {
  const pathname = usePathname()
  if (pathname.startsWith('/pets')) return null
  return <Logo className="text-white" />
}

/** Always shows only the paw icon (no wordmark). */
export function FooterLogo() {
  return <LogoIcon className="size-10 text-white" />
}

/** Copyright — "2024 © All rights reserved", no brand name. */
export function FooterCopyright() {
  return (
    <p className="font-nunito text-sm text-white/80">
      2024 © All rights reserved
    </p>
  )
}

/** Hides the footer entirely on /pets* routes. */
export function FooterVisibilityWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/pets')) return null
  return <>{children}</>
}
