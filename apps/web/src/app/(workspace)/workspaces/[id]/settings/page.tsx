import { notFound, redirect } from 'next/navigation'
import { WorkspaceLocationForm } from '~/components/features/workspaces/workspace-location-form'
import { WorkspaceMembersPanel } from '~/components/features/workspaces/workspace-members-panel'
import { WorkspaceProfileForm } from '~/components/features/workspaces/workspace-profile-form'
import { parseAddressLine } from '~/lib/format-address'
import { getServerPrincipal } from '~/lib/get-server-principal'
import { workspaceRepository } from '~/server/repositories'
import { getWorkspaceById } from '~/server/use-cases'
import { SettingsTabs } from './settings-tabs'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function WorkspaceSettingsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params
  const { tab = 'perfil' } = await searchParams

  const principal = await getServerPrincipal()
  if (!principal) redirect('/login')

  const result = await getWorkspaceById(workspaceRepository, principal, {
    id,
    membersPage: 1,
    membersPerPage: 50,
  })

  if (!result.success) {
    if (result.code === 'NOT_FOUND') notFound()
    redirect('/login')
  }

  const { workspace } = result
  const loc = workspace.primaryLocation

  return (
    <div className="flex flex-col gap-6 p-8">
      <div>
        <h1 className="font-nunito text-accent-navy text-[32px] leading-none font-extrabold">
          Configurações
        </h1>
        <p className="font-nunito text-accent-navy/50 mt-1 text-[15px]">
          {workspace.name}
        </p>
      </div>

      <SettingsTabs activeTab={tab}>
        {{
          perfil: (
            <WorkspaceProfileForm
              workspaceId={id}
              defaultValues={{
                name: workspace.name,
                description: workspace.description,
                phone: workspace.phone ?? '',
                whatsapp: workspace.whatsapp ?? '',
                emailPublic: workspace.emailPublic ?? '',
                website: workspace.website ?? '',
                instagram: workspace.instagram ?? '',
              }}
            />
          ),
          localizacao: (
            <WorkspaceLocationForm
              workspaceId={id}
              lat={loc?.lat ?? 0}
              lng={loc?.lng ?? 0}
              defaultValues={{
                cityPlaceId: loc?.cityPlace?.id ?? '',
                ...parseAddressLine(loc?.addressLine ?? ''),
                neighborhood: loc?.neighborhood ?? '',
                zipCode: loc?.zipCode ?? '',
              }}
            />
          ),
          membros: (
            <WorkspaceMembersPanel
              workspaceId={id}
              members={workspace.members?.items ?? []}
              currentUserId={principal.userId}
            />
          ),
        }}
      </SettingsTabs>
    </div>
  )
}
