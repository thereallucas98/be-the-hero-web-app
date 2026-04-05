'use client'

import type { ComponentProps } from 'react'
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
import { LogoIcon } from '~/components/ui/logo'
import { LogoutButton } from '~/components/features/auth/logout-button'

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: React.ElementType
  active: boolean
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex size-11 cursor-pointer items-center justify-center rounded-[12px] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
        active
          ? 'bg-white/20 text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </Link>
  )
}

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

interface AdminSidebarProps extends ComponentProps<'aside'> {}

export function AdminSidebar({ className, ...props }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      data-slot="admin-sidebar"
      className={cn(
        'bg-brand-primary hidden w-20 shrink-0 flex-col items-center gap-2 py-8 lg:flex',
        className,
      )}
      {...props}
    >
      <Link href="/" aria-label="Página inicial" className="mb-4">
        <LogoIcon className="h-10 w-auto text-white" />
      </Link>

      <nav
        className="flex flex-1 flex-col items-center gap-1"
        aria-label="Menu admin"
      >
        {NAV_ITEMS.map(({ href, label, icon }) => (
          <NavItem
            key={href}
            href={href}
            label={label}
            icon={icon}
            active={pathname.startsWith(href)}
          />
        ))}
      </nav>

      <LogoutButton className="mt-2" />
    </aside>
  )
}
