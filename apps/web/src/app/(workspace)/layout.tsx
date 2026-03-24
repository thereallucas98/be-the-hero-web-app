import type { ReactNode } from 'react'
import { WorkspaceSidebar } from '~/components/features/workspaces/workspace-sidebar'

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-brand-primary-pale flex min-h-dvh">
      <WorkspaceSidebar backHref="/" />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
