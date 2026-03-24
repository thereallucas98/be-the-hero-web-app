import { Settings } from 'lucide-react'
import Link from 'next/link'
import type { ComponentProps } from 'react'
import { LogoIcon } from '~/components/ui/logo'
import { cn } from '~/lib/utils'

interface WorkspaceHeaderBannerProps extends ComponentProps<'div'> {
  name: string
  address: string
  settingsHref?: string
}

export function WorkspaceHeaderBanner({
  name,
  address,
  settingsHref = '#',
  className,
  ...props
}: WorkspaceHeaderBannerProps) {
  return (
    <div
      data-slot="workspace-header-banner"
      className={cn(
        'bg-accent-navy flex items-center gap-4 rounded-[20px] px-6 py-4',
        className,
      )}
      {...props}
    >
      {/* Org avatar */}
      <div className="flex size-16 shrink-0 items-center justify-center rounded-[15px] bg-[#f27006]">
        <LogoIcon className="h-7 w-auto text-white" />
      </div>

      {/* Name + address */}
      <div className="flex flex-1 flex-col text-white">
        <p className="font-nunito text-[30px] leading-tight font-extrabold">
          {name}
        </p>
        <p className="font-nunito text-[16px] font-semibold">{address}</p>
      </div>

      {/* Settings */}
      <Link
        href={settingsHref}
        aria-label="Configurações"
        className="flex size-16 shrink-0 items-center justify-center rounded-[15px] bg-[#114a80] focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        <Settings className="size-6 text-white" aria-hidden />
      </Link>
    </div>
  )
}
