import Link from 'next/link'
import { CampaignCard } from '~/components/features/campaigns/campaign-card'

interface Campaign {
  id: string
  title: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  endsAt: Date | null
}

interface WorkspaceCampaignsPreviewProps {
  workspaceId: string
  workspaceName: string
  campaigns: Campaign[]
}

export function WorkspaceCampaignsPreview({
  workspaceId,
  workspaceName,
  campaigns,
}: WorkspaceCampaignsPreviewProps) {
  if (campaigns.length === 0) return null

  return (
    <div
      data-slot="workspace-campaigns-preview"
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-nunito text-accent-navy text-[20px] font-bold sm:text-[24px]">
          Campanhas ativas
        </h2>
        <Link
          href={`/campaigns?workspaceId=${workspaceId}`}
          className="font-nunito text-brand-primary focus-visible:ring-brand-primary text-[13px] font-semibold underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:outline-none sm:text-[14px]"
        >
          Ver todas
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {campaigns.map((campaign) => (
          <CampaignCard
            key={campaign.id}
            id={campaign.id}
            title={campaign.title}
            description=""
            goalAmount={campaign.goalAmount}
            currentAmount={campaign.currentAmount}
            currency={campaign.currency}
            coverImageUrl={campaign.coverImageUrl}
            endsAt={campaign.endsAt}
            workspace={{ id: workspaceId, name: workspaceName }}
            pet={null}
          />
        ))}
      </div>
    </div>
  )
}
