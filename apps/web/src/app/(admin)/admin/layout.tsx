import type { ReactNode } from 'react'
import { AdminSidebar } from '~/components/features/admin/admin-sidebar'
import { AdminBottomNav } from '~/components/features/admin/admin-bottom-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-background flex min-h-dvh">
      <AdminSidebar />
      <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
      <AdminBottomNav />
    </div>
  )
}
