'use client'

import { LogOut } from 'lucide-react'
import { useCallback } from 'react'
import { cn } from '~/lib/utils'

interface LogoutButtonProps {
  className?: string
  variant?: 'sidebar' | 'bottom-nav'
}

export function LogoutButton({
  className,
  variant = 'sidebar',
}: LogoutButtonProps) {
  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
    window.location.href = '/login'
  }, [])

  if (variant === 'bottom-nav') {
    return (
      <button
        onClick={handleLogout}
        aria-label="Sair"
        className={cn(
          'flex shrink-0 cursor-pointer flex-col items-center gap-0.5 px-3 py-2 text-[10px] text-white/60 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
          className,
        )}
      >
        <LogOut className="size-5" aria-hidden />
        <span>Sair</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleLogout}
      aria-label="Sair"
      className={cn(
        'flex size-11 cursor-pointer items-center justify-center rounded-[12px] text-white/60 transition-colors hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none',
        className,
      )}
    >
      <LogOut className="size-5" aria-hidden />
    </button>
  )
}
