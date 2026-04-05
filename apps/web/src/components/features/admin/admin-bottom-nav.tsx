'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BarChart3,
  Building2,
  ClipboardCheck,
  FileText,
  HandCoins,
  MapPin,
  Megaphone,
  PawPrint,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { LogoutButton } from '~/components/features/auth/logout-button'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Métricas', icon: BarChart3 },
  { href: '/admin/pets', label: 'Pets', icon: PawPrint },
  { href: '/admin/workspaces', label: 'Workspaces', icon: Building2 },
  { href: '/admin/campaigns', label: 'Campanhas', icon: Megaphone },
  { href: '/admin/donations', label: 'Doações', icon: HandCoins },
  { href: '/admin/follow-ups', label: 'Follow-ups', icon: ClipboardCheck },
  { href: '/admin/coverage', label: 'Cobertura', icon: MapPin },
  { href: '/admin/audit-logs', label: 'Logs', icon: FileText },
] as const

export function AdminBottomNav() {
  const pathname = usePathname()

  return (
    <nav
      data-slot="admin-bottom-nav"
      className="bg-brand-primary fixed inset-x-0 bottom-0 z-40 flex h-16 items-center overflow-x-auto lg:hidden"
      aria-label="Menu admin"
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
              'flex shrink-0 cursor-pointer flex-col items-center gap-0.5 px-3 py-2 text-[10px] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
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
