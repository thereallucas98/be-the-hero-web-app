import type { ReactNode } from 'react'
import { WorkspaceSidebar } from '~/components/features/workspaces/workspace-sidebar'

interface WorkspaceIdLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

export default async function WorkspaceIdLayout({
  children,
  params,
}: WorkspaceIdLayoutProps) {
  const { id } = await params

  return (
    <div className="bg-background flex min-h-dvh">
      <WorkspaceSidebar workspaceId={id} backHref="/" />
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
