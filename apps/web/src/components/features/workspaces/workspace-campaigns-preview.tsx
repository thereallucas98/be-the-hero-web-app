import { Progress } from '~/components/ui/progress'

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
  campaigns: Campaign[]
}

function formatCurrency(value: string, currency: string): string {
  const num = parseFloat(value)
  if (currency === 'BRL') {
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  }
  return `${currency} ${num.toFixed(2)}`
}

export function WorkspaceCampaignsPreview({
  campaigns,
}: WorkspaceCampaignsPreviewProps) {
  if (campaigns.length === 0) return null

  return (
    <div
      data-slot="workspace-campaigns-preview"
      className="flex flex-col gap-4"
    >
      <h2 className="font-nunito text-accent-navy text-[20px] font-bold sm:text-[24px]">
        Campanhas ativas
      </h2>

      <div className="flex flex-col gap-4">
        {campaigns.map((campaign) => {
          const goal = parseFloat(campaign.goalAmount)
          const current = parseFloat(campaign.currentAmount)
          const pct =
            goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

          return (
            <div
              key={campaign.id}
              data-slot="campaign-card"
              className="border-border overflow-hidden rounded-[16px] border bg-white"
            >
              {/* Cover image */}
              <div className="bg-brand-primary-pale relative h-[140px] w-full overflow-hidden sm:h-[160px]">
                {campaign.coverImageUrl && (
                  <img
                    src={campaign.coverImageUrl}
                    alt={campaign.title}
                    className="absolute inset-0 size-full object-cover"
                  />
                )}
              </div>

              {/* Content */}
              <div className="flex flex-col gap-3 p-4 sm:p-5">
                <p className="font-nunito text-accent-navy text-[16px] leading-snug font-bold sm:text-[18px]">
                  {campaign.title}
                </p>

                <Progress value={pct} className="h-2" />

                <div className="flex items-center justify-between gap-2">
                  <span className="font-nunito text-accent-navy/70 text-[13px] font-semibold">
                    {formatCurrency(campaign.currentAmount, campaign.currency)}
                    {' / '}
                    {formatCurrency(campaign.goalAmount, campaign.currency)}
                  </span>
                  <span className="font-nunito text-accent-navy text-[13px] font-bold">
                    {pct}%
                  </span>
                </div>

                {campaign.endsAt && (
                  <p className="font-nunito text-muted-foreground text-[12px] font-semibold">
                    Até{' '}
                    {new Date(campaign.endsAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
