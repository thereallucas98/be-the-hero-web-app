import { Globe, Instagram, Mail, Phone } from 'lucide-react'

function buildWhatsAppUrl(raw: string | null): string | null {
  if (!raw) return null
  const digits = raw.replace(/\D/g, '')
  return `https://wa.me/55${digits}`
}

interface WorkspaceProfileContactProps {
  phone: string | null
  whatsapp: string | null
  emailPublic: string | null
  website: string | null
  instagram: string | null
}

interface ContactRowProps {
  href: string
  icon: React.ReactNode
  label: string
  external?: boolean
}

function ContactRow({ href, icon, label, external = false }: ContactRowProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="bg-accent-navy/5 hover:bg-accent-navy/10 focus-visible:ring-ring flex items-center gap-3 rounded-[12px] px-4 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <span className="text-accent-navy shrink-0">{icon}</span>
      <span className="font-nunito text-accent-navy text-[14px] font-semibold sm:text-[15px]">
        {label}
      </span>
    </a>
  )
}

export function WorkspaceProfileContact({
  phone,
  whatsapp,
  emailPublic,
  website,
  instagram,
}: WorkspaceProfileContactProps) {
  const waUrl = buildWhatsAppUrl(whatsapp)
  const hasAny = waUrl ?? phone ?? emailPublic ?? website ?? instagram

  return (
    <div data-slot="workspace-profile-contact" className="flex flex-col gap-4">
      <h2 className="font-nunito text-accent-navy text-[20px] font-bold sm:text-[24px]">
        Contato
      </h2>

      {hasAny ? (
        <div className="flex flex-col gap-2">
          {waUrl && (
            <ContactRow
              href={waUrl}
              external
              label={whatsapp!}
              icon={
                <svg
                  viewBox="0 0 24 24"
                  className="fill-accent-navy size-5"
                  aria-hidden
                >
                  <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.765.463 3.423 1.27 4.87L2 22l5.264-1.246A9.958 9.958 0 0 0 12.004 22C17.525 22 22 17.525 22 12.004 22 6.479 17.525 2 12.004 2Zm5.77 13.944c-.243.684-1.204 1.252-1.97 1.418-.524.112-1.208.2-3.51-.753-2.944-1.198-4.839-4.186-4.986-4.38-.142-.195-1.191-1.584-1.191-3.022 0-1.438.751-2.141 1.018-2.435.243-.268.528-.336.705-.336l.508.01c.163.007.38-.062.595.454.222.53.754 1.835.82 1.969.067.133.11.29.022.466-.086.177-.13.287-.258.44-.13.153-.272.342-.388.46-.13.128-.265.267-.114.523.151.255.672 1.11 1.444 1.797.992.886 1.829 1.16 2.086 1.294.257.133.407.111.558-.067.151-.177.648-.756.82-1.014.171-.258.343-.214.578-.129.236.085 1.499.708 1.756.836.257.13.428.193.49.3.063.11.063.635-.18 1.32Z" />
                </svg>
              }
            />
          )}

          {phone && (
            <ContactRow
              href={`tel:${phone.replace(/\D/g, '')}`}
              label={phone}
              icon={<Phone className="size-5" aria-hidden />}
            />
          )}

          {emailPublic && (
            <ContactRow
              href={`mailto:${emailPublic}`}
              label={emailPublic}
              icon={<Mail className="size-5" aria-hidden />}
            />
          )}

          {website && (
            <ContactRow
              href={website}
              external
              label={website.replace(/^https?:\/\//, '')}
              icon={<Globe className="size-5" aria-hidden />}
            />
          )}

          {instagram && (
            <ContactRow
              href={`https://instagram.com/${instagram.replace(/^@/, '')}`}
              external
              label={instagram.startsWith('@') ? instagram : `@${instagram}`}
              icon={<Instagram className="size-5" aria-hidden />}
            />
          )}
        </div>
      ) : (
        <p className="font-nunito text-muted-foreground text-[15px] font-semibold">
          Nenhum contato disponível
        </p>
      )}
    </div>
  )
}
