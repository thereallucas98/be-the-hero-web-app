import Link from 'next/link'
import { Progress } from '~/components/ui/progress'

interface CampaignCardProps {
  id: string
  title: string
  description: string
  goalAmount: string
  currentAmount: string
  currency: string
  coverImageUrl: string | null
  endsAt: Date | null
  workspace: { id: string; name: string }
  pet: { id: string; name: string; species: string } | null
}

function formatBRL(value: string): string {
  return parseFloat(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

export function CampaignCard({
  title,
  description,
  goalAmount,
  currentAmount,
  currency,
  coverImageUrl,
  endsAt,
  workspace,
  pet,
}: CampaignCardProps) {
  const goal = parseFloat(goalAmount)
  const current = parseFloat(currentAmount)
  const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0

  const formattedCurrent =
    currency === 'BRL'
      ? formatBRL(currentAmount)
      : `${currency} ${current.toFixed(2)}`
  const formattedGoal =
    currency === 'BRL'
      ? formatBRL(goalAmount)
      : `${currency} ${goal.toFixed(2)}`

  return (
    <div
      data-slot="campaign-card"
      className="border-border flex flex-col overflow-hidden rounded-[16px] border bg-white"
    >
      {/* Cover image */}
      <div className="bg-brand-primary-pale relative h-[160px] w-full shrink-0 overflow-hidden sm:h-[180px]">
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt={title}
            className="absolute inset-0 size-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        {/* Title */}
        <p className="font-nunito text-accent-navy line-clamp-2 text-[15px] leading-snug font-bold sm:text-[17px]">
          {title}
        </p>

        {/* Description */}
        <p className="font-nunito text-accent-navy/60 line-clamp-2 text-[13px] leading-relaxed font-semibold">
          {description}
        </p>

        {/* Workspace link */}
        <Link
          href={`/workspaces/${workspace.id}`}
          className="font-nunito text-brand-primary focus-visible:ring-brand-primary w-fit text-[12px] font-semibold hover:underline focus-visible:ring-2 focus-visible:outline-none"
        >
          {workspace.name}
        </Link>

        {/* Pet chip */}
        {pet && (
          <span className="font-nunito bg-brand-primary-pale text-accent-navy w-fit rounded-full px-3 py-1 text-[11px] font-semibold">
            Para: {pet.name}
          </span>
        )}

        {/* Progress — pushed to bottom */}
        <div className="mt-auto flex flex-col gap-2 pt-2">
          <Progress value={pct} className="h-2" />

          <div className="flex items-center justify-between gap-2">
            <span className="font-nunito text-accent-navy/70 text-[12px] font-semibold">
              {formattedCurrent} / {formattedGoal}
            </span>
            <span className="font-nunito text-accent-navy text-[12px] font-bold">
              {pct}%
            </span>
          </div>

          {endsAt && (
            <p className="font-nunito text-muted-foreground text-[11px] font-semibold">
              Encerra em{' '}
              {new Date(endsAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
