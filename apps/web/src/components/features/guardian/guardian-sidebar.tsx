'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Heart, Home, User } from 'lucide-react'
import { cn } from '~/lib/utils'
import { LogoIcon } from '~/components/ui/logo'

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

interface GuardianSidebarProps extends ComponentProps<'aside'> {
  backHref?: string
}

const NAV_ITEMS = [
  { href: '/guardian/interests', label: 'Interesses', icon: Heart },
  { href: '/guardian/adoptions', label: 'Adoções', icon: Home },
  { href: '/guardian/profile', label: 'Perfil', icon: User },
] as const

export function GuardianSidebar({
  backHref = '/',
  className,
  ...props
}: GuardianSidebarProps) {
  const pathname = usePathname()

  return (
    <aside
      data-slot="guardian-sidebar"
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
        aria-label="Menu do tutor"
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
