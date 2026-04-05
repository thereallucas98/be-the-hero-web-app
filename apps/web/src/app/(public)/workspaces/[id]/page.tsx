import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { WorkspaceCampaignsPreview } from '~/components/features/workspaces/workspace-campaigns-preview'
import { WorkspacePetsPreview } from '~/components/features/workspaces/workspace-pets-preview'
import { WorkspaceProfileContact } from '~/components/features/workspaces/workspace-profile-contact'
import { WorkspaceProfileHeader } from '~/components/features/workspaces/workspace-profile-header'
import { LogoIcon } from '~/components/ui/logo'
import { Separator } from '~/components/ui/separator'
import { workspaceRepository } from '~/server/repositories'
import { getPublicWorkspace } from '~/server/use-cases'

interface WorkspacePageProps {
  params: Promise<{ id: string }>
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { id } = await params
  const result = await getPublicWorkspace(workspaceRepository, id)

  if (!result.success) notFound()

  const { workspace } = result

  const location = workspace.primaryLocation?.cityPlace.name ?? null

  const hasPets = workspace.approvedPets.length > 0
  const hasCampaigns = workspace.activeCampaigns.length > 0

  return (
    <div className="bg-background flex min-h-dvh">
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside className="bg-brand-primary sticky top-0 hidden h-dvh w-20 shrink-0 flex-col items-center justify-between py-8 lg:flex xl:w-24">
        <Link href="/" aria-label="Voltar à página inicial">
          <LogoIcon className="size-10 text-white xl:size-11" />
        </Link>

        <Link
          href="/pets"
          aria-label="Voltar para listagem de animais"
          className="bg-accent-yellow flex size-12 items-center justify-center rounded-[15px] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <ArrowLeft className="size-5 text-white" aria-hidden />
        </Link>
      </aside>

      {/* ── Main content ────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center px-4 py-6 sm:px-6 lg:py-10">
        {/* Mobile back + breadcrumb */}
        <div className="mb-4 flex w-full max-w-[700px] items-center gap-3 lg:hidden">
          <Link
            href="/pets"
            aria-label="Voltar para listagem de animais"
            className="bg-brand-primary focus-visible:ring-brand-primary flex size-10 shrink-0 items-center justify-center rounded-[12px] transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
          >
            <ArrowLeft className="size-4 text-white" aria-hidden />
          </Link>
          <p className="font-nunito text-accent-navy/50 text-[14px] font-semibold">
            Organizações parceiras
          </p>
        </div>

        {/* Desktop breadcrumb */}
        <p className="font-nunito text-accent-navy/40 mb-4 hidden text-[16px] font-semibold lg:block">
          Organizações parceiras
        </p>

        {/* White card */}
        <div className="w-full max-w-[700px] overflow-hidden rounded-[20px] bg-white shadow-sm">
          <div className="px-5 pt-6 pb-8 sm:px-7">
            <WorkspaceProfileHeader
              name={workspace.name}
              type={workspace.type}
              location={location}
              description={workspace.description}
            />

            <Separator className="my-6" />

            <WorkspaceProfileContact
              phone={workspace.phone}
              whatsapp={workspace.whatsapp}
              emailPublic={workspace.emailPublic}
              website={workspace.website}
              instagram={workspace.instagram}
            />

            {hasPets && (
              <>
                <Separator className="my-6" />
                <WorkspacePetsPreview
                  workspaceId={workspace.id}
                  pets={workspace.approvedPets}
                />
              </>
            )}

            {hasCampaigns && (
              <>
                <Separator className="my-6" />
                <WorkspaceCampaignsPreview
                  campaigns={workspace.activeCampaigns}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
