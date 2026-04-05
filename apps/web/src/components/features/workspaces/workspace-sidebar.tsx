'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  HandHeart,
  Heart,
  Megaphone,
  PawPrint,
  Settings,
} from 'lucide-react'
import { cn } from '~/lib/utils'
import { LogoIcon } from '~/components/ui/logo'

// ─── Nav item ─────────────────────────────────────────────────────────────────

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
        'flex size-11 items-center justify-center rounded-[12px] transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
        active
          ? 'bg-white/20 text-white'
          : 'text-white/60 hover:bg-white/10 hover:text-white',
      )}
    >
      <Icon className="size-5" aria-hidden />
    </Link>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface WorkspaceSidebarProps extends ComponentProps<'aside'> {
  workspaceId: string
  backHref?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspaceSidebar({
  workspaceId,
  backHref = '/',
  className,
  ...props
}: WorkspaceSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { segment: 'pets', label: 'Pets', icon: PawPrint },
    { segment: 'interests', label: 'Interesses', icon: Heart },
    { segment: 'adoptions', label: 'Adoções', icon: HandHeart },
    { segment: 'campaigns', label: 'Campanhas', icon: Megaphone },
    { segment: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <aside
      data-slot="workspace-sidebar"
      className={cn(
        'bg-brand-primary flex w-20 shrink-0 flex-col items-center gap-2 py-8',
        className,
      )}
      {...props}
    >
      {/* Logo */}
      <Link href="/" aria-label="Página inicial" className="mb-4">
        <LogoIcon className="h-10 w-auto text-white" />
      </Link>

      {/* Nav items */}
      <nav
        className="flex flex-1 flex-col items-center gap-1"
        aria-label="Menu do workspace"
      >
        {navItems.map(({ segment, label, icon }) => {
          const href = `/workspaces/${workspaceId}/${segment}`
          return (
            <NavItem
              key={segment}
              href={href}
              label={label}
              icon={icon}
              active={pathname.startsWith(href)}
            />
          )
        })}
      </nav>

      {/* Back button */}
      <Link
        href={backHref}
        aria-label="Voltar"
        className="bg-accent-yellow focus-visible:ring-accent-yellow mt-2 flex size-11 items-center justify-center rounded-[15px] focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="text-accent-navy size-5" aria-hidden />
      </Link>
    </aside>
  )
}
