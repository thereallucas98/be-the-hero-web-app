import type { ReactNode } from 'react'
import { GuardianSidebar } from '~/components/features/guardian/guardian-sidebar'
import { GuardianBottomNav } from '~/components/features/guardian/guardian-bottom-nav'

export default function GuardianLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh">
      <GuardianSidebar />
      <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
      <GuardianBottomNav />
    </div>
  )
}
