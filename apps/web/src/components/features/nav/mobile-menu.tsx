'use client'

import { X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { Logo } from '~/components/ui/logo'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/sobre', label: 'Sobre o app' },
  { href: '/pets', label: 'Animais disponíveis' },
  { href: '/sobre-bethehero', label: 'Sobre o BeTheHero' },
  { href: '/contato', label: 'contato' },
]

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  return (
    <div
      ref={menuRef}
      data-slot="mobile-menu"
      data-open={open ? '' : undefined}
      className="bg-brand-primary-dark pointer-events-none absolute top-0 left-0 w-full -translate-y-2 rounded-b-[20px] opacity-0 transition-all duration-200 ease-out data-open:pointer-events-auto data-open:translate-y-0 data-open:opacity-100"
      aria-hidden={!open}
    >
      {/* Header row — espelha o layout do site-header */}
      <div className="flex items-center justify-between px-5 py-4">
        <Logo className="text-white" />
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={onClose}
          className="text-brand-primary focus-visible:ring-ring flex size-10 items-center justify-center rounded-[8px] bg-white focus-visible:ring-2 focus-visible:outline-none"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* Separator */}
      <div className="mx-5 h-px bg-white/20" />

      {/* Nav links */}
      <nav className="flex flex-col gap-3 px-5 pt-5 pb-6">
        {NAV_LINKS.map(({ href, label }) => {
          const isActive = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={
                isActive
                  ? 'font-nunito text-lg font-bold text-white'
                  : 'font-nunito text-lg font-semibold text-white/50'
              }
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
