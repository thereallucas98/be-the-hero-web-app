'use client'

import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/sobre', label: 'Sobre o app' },
  { href: '/pets', label: 'Animais disponíveis' },
  { href: '/sobre-bethehero', label: 'Sobre o BeTheHero' },
  { href: '/contato', label: 'contato' },
]

export function PhoneCard() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div
      data-slot="phone-card"
      className="rounded-card w-148 shrink-0 overflow-hidden"
    >
      {/* Main card — gradient background */}
      <div
        className="relative h-135.25"
        style={{
          background:
            'linear-gradient(155.12deg, #f36a6f 17.228%, #e44449 73.769%)',
        }}
      >
        {/* Hamburger / Close toggle */}
        <button
          type="button"
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
          className="text-brand-primary focus-visible:ring-ring absolute top-12.5 left-12.5 z-10 flex size-18 items-center justify-center rounded-[15px] bg-white focus-visible:ring-2 focus-visible:outline-none"
        >
          {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>

        {/* Dog image — fades out when menu opens */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: menuOpen ? 0 : 1,
            pointerEvents: menuOpen ? 'none' : 'auto',
          }}
        >
          <Image
            src="/images/hero-pets.png"
            alt="Animal aguardando adoção"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Nav menu overlay — fades in when menu opens */}
        <nav
          aria-label="Navegação principal"
          className="absolute inset-0 flex flex-col justify-end gap-4 px-12.5 pt-38 pb-12 transition-opacity duration-300"
          style={{
            opacity: menuOpen ? 1 : 0,
            pointerEvents: menuOpen ? 'auto' : 'none',
          }}
        >
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`text-[36px] leading-[1.1] tracking-[-0.72px] text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none ${
                  isActive ? 'font-bold' : 'font-normal opacity-50'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* CTA section — flush with bottom of red hero */}
      <div className="bg-brand-primary-dark px-12.5 pt-10 pb-16">
        <Link
          href="/pets"
          className="rounded-button text-accent-navy focus-visible:ring-ring flex h-18 w-full items-center justify-center bg-white text-xl font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
        >
          Acesse agora
        </Link>
      </div>
    </div>
  )
}
