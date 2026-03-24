import { notFound, redirect } from 'next/navigation'
import { AddPetForm } from '~/components/features/pets/add-pet-form'
import { WorkspaceHeaderBanner } from '~/components/features/workspaces/workspace-header-banner'
import { getServerPrincipal } from '~/lib/get-server-principal'
import { workspaceRepository } from '~/server/repositories'
import { getWorkspaceById } from '~/server/use-cases'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AddPetPage({ params }: Props) {
  const { id } = await params

  const principal = await getServerPrincipal()
  if (!principal) redirect('/login')

  const result = await getWorkspaceById(workspaceRepository, principal, { id })

  if (!result.success) {
    if (result.code === 'NOT_FOUND') notFound()
    redirect('/login')
  }

  const { workspace } = result
  const address = workspace.primaryLocation?.addressLine ?? ''

  return (
    <div className="flex flex-col gap-4 p-8">
      <WorkspaceHeaderBanner
        name={workspace.name}
        address={address}
        settingsHref={`/workspaces/${id}/settings`}
      />
      <AddPetForm workspaceId={id} />
    </div>
  )
}
