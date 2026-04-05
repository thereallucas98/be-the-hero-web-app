'use client'

import type { ComponentProps } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Heart, Home, User } from 'lucide-react'
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

interface GuardianSidebarProps extends ComponentProps<'aside'> {}

const NAV_ITEMS = [
  { href: '/guardian/interests', label: 'Interesses', icon: Heart },
  { href: '/guardian/adoptions', label: 'Adoções', icon: Home },
  { href: '/guardian/profile', label: 'Perfil', icon: User },
] as const

export function GuardianSidebar({ className, ...props }: GuardianSidebarProps) {
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

      <LogoutButton className="mt-2" />
    </aside>
  )
}
