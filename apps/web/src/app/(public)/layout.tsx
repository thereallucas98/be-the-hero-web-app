import type { ReactNode } from 'react'
import { SiteFooter } from '~/components/features/landing/site-footer'
import { SiteHeader } from '~/components/features/nav/site-header'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}

export default PublicLayout
