import { LogoIcon } from '~/components/ui/logo'

interface WorkspaceContactCardProps {
  name: string
  address: string | null
  phone: string | null
  whatsapp: string | null
}

export function WorkspaceContactCard({
  name,
  address,
  phone,
  whatsapp,
}: WorkspaceContactCardProps) {
  const contact = whatsapp ?? phone

  return (
    <div data-slot="workspace-contact-card" className="flex flex-col gap-3">
      {/* Name + address row */}
      <div className="flex items-start gap-4">
        {/* Orange icon */}
        <div className="flex size-[56px] shrink-0 items-center justify-center rounded-[14px] bg-[#f27006] sm:size-[64px]">
          <LogoIcon className="size-6 text-white sm:size-7" />
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="font-nunito text-accent-navy text-[18px] leading-tight font-bold sm:text-[20px]">
            {name}
          </p>
          {address && (
            <p className="font-nunito text-accent-navy/70 text-[14px] leading-snug font-semibold sm:text-[15px]">
              {address}
            </p>
          )}
        </div>
      </div>

      {/* WhatsApp / phone badge */}
      {contact && (
        <div className="bg-accent-navy/5 flex w-fit items-center gap-2 rounded-[10px] px-4 py-3">
          {/* WhatsApp icon via SVG inline */}
          <svg
            viewBox="0 0 24 24"
            className="fill-accent-navy size-5 shrink-0"
            aria-hidden
          >
            <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.765.463 3.423 1.27 4.87L2 22l5.264-1.246A9.958 9.958 0 0 0 12.004 22C17.525 22 22 17.525 22 12.004 22 6.479 17.525 2 12.004 2Zm5.77 13.944c-.243.684-1.204 1.252-1.97 1.418-.524.112-1.208.2-3.51-.753-2.944-1.198-4.839-4.186-4.986-4.38-.142-.195-1.191-1.584-1.191-3.022 0-1.438.751-2.141 1.018-2.435.243-.268.528-.336.705-.336l.508.01c.163.007.38-.062.595.454.222.53.754 1.835.82 1.969.067.133.11.29.022.466-.086.177-.13.287-.258.44-.13.153-.272.342-.388.46-.13.128-.265.267-.114.523.151.255.672 1.11 1.444 1.797.992.886 1.829 1.16 2.086 1.294.257.133.407.111.558-.067.151-.177.648-.756.82-1.014.171-.258.343-.214.578-.129.236.085 1.499.708 1.756.836.257.13.428.193.49.3.063.11.063.635-.18 1.32Z" />
          </svg>
          <span className="font-nunito text-accent-navy text-[15px] font-semibold">
            {contact}
          </span>
        </div>
      )}
    </div>
  )
}
