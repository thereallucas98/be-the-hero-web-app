import type { ComponentProps } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '~/lib/utils'
import { LogoIcon } from '~/components/ui/logo'

interface WorkspaceSidebarProps extends ComponentProps<'aside'> {
  backHref?: string
}

export function WorkspaceSidebar({
  backHref = '/',
  className,
  ...props
}: WorkspaceSidebarProps) {
  return (
    <aside
      data-slot="workspace-sidebar"
      className={cn(
        'bg-brand-primary flex w-24 shrink-0 flex-col items-center justify-between py-8',
        className,
      )}
      {...props}
    >
      <LogoIcon className="h-12 w-auto text-white" />

      <Link
        href={backHref}
        aria-label="Voltar"
        className="bg-accent-yellow focus-visible:ring-accent-yellow flex size-12 items-center justify-center rounded-[15px] focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="text-accent-navy size-6" aria-hidden />
      </Link>
    </aside>
  )
}
