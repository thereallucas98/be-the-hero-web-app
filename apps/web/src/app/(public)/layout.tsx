import type { ReactNode } from 'react'
import { SiteHeader } from '~/components/features/nav/site-header'

interface PublicLayoutProps {
  children: ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}

export default PublicLayout
