import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '~/components/features/admin/admin-sidebar'
import { AdminBottomNav } from '~/components/features/admin/admin-bottom-nav'
import { getServerPrincipal } from '~/lib/get-server-principal'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const principal = await getServerPrincipal()
  if (!principal) redirect('/login')

  const isSuperAdmin = principal.role === 'SUPER_ADMIN'

  return (
    <div className="bg-background flex min-h-dvh">
      <AdminSidebar showAuditLogs={isSuperAdmin} />
      <main className="flex flex-1 flex-col pb-16 lg:pb-0">{children}</main>
      <AdminBottomNav showAuditLogs={isSuperAdmin} />
    </div>
  )
}
