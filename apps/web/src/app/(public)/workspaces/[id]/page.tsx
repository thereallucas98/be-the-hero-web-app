interface WorkspacePageProps {
  params: Promise<{ id: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params
  return (
    <main className="px-5 py-16">
      <p className="text-foreground-subtle text-center text-lg">
        Em breve — Organização {id}
      </p>
    </main>
  )
}
