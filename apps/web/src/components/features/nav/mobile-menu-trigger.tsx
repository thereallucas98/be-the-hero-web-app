'use client'

import { Menu } from 'lucide-react'
import { useState } from 'react'
import { MobileMenu } from './mobile-menu'

export function MobileMenuTrigger() {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Abrir menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="text-brand-primary flex size-10 items-center justify-center rounded-[8px] bg-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        <Menu className="size-4" />
      </button>

      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
