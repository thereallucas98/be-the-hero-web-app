import type { ReactNode } from 'react'

// Detail pages (pet profile, workspace profile) have their own full-screen
// sidebar layout — deliberately no SiteHeader or SiteFooter here.
export default function DetailLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
