import { MapPin } from 'lucide-react'
import { Badge } from '~/components/ui/badge'

const TYPE_LABEL: Record<string, string> = {
  ONG: 'ONG',
  CLINIC: 'Clínica',
  PETSHOP: 'Petshop',
}

interface WorkspaceProfileHeaderProps {
  name: string
  type: string
  location: string | null
  description: string
}

export function WorkspaceProfileHeader({
  name,
  type,
  location,
  description,
}: WorkspaceProfileHeaderProps) {
  return (
    <div data-slot="workspace-profile-header" className="flex flex-col gap-3">
      {/* Name + badges row */}
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="font-nunito text-accent-navy text-[28px] leading-tight font-extrabold tracking-tight sm:text-[36px]">
          {name}
        </h1>
        <Badge variant="secondary" className="shrink-0 text-[12px]">
          {TYPE_LABEL[type] ?? type}
        </Badge>
      </div>

      {/* Location chip */}
      {location && (
        <div className="text-accent-navy/60 flex items-center gap-1.5">
          <MapPin className="size-4 shrink-0" aria-hidden />
          <span className="font-nunito text-[14px] font-semibold">
            {location}
          </span>
        </div>
      )}

      {/* Description */}
      <p className="font-nunito text-accent-navy/80 text-[15px] leading-relaxed font-semibold sm:text-[17px]">
        {description}
      </p>
    </div>
  )
}
