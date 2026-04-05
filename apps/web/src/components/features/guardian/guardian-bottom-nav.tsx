'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, User } from 'lucide-react'
import { cn } from '~/lib/utils'
import { LogoutButton } from '~/components/features/auth/logout-button'

const NAV_ITEMS = [
  { href: '/guardian/interests', label: 'Interesses', icon: Heart },
  { href: '/guardian/adoptions', label: 'Adoções', icon: Home },
  { href: '/guardian/profile', label: 'Perfil', icon: User },
] as const

export function GuardianBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      data-slot="guardian-bottom-nav"
      className="bg-brand-primary fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around lg:hidden"
      aria-label="Menu do tutor"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-2 text-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
              active ? 'text-white' : 'text-white/60',
            )}
          >
            <Icon className="size-5" aria-hidden />
            <span>{label}</span>
          </Link>
        )
      })}
      <LogoutButton variant="bottom-nav" />
    </nav>
  )
}
