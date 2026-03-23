import Image from 'next/image'
import Link from 'next/link'
import { Avatar, AvatarFallback } from '~/components/ui/avatar'
import { Reveal } from '~/components/ui/reveal'
import { PhoneCard } from './phone-card'

const SOCIAL_PROOF_AVATARS = [
  { initials: 'A', label: 'Amigo A' },
  { initials: 'B', label: 'Amigo B' },
  { initials: 'C', label: 'Amigo C' },
  { initials: 'D', label: 'Amigo D' },
]

function SocialProof({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex -space-x-2">
        {SOCIAL_PROOF_AVATARS.map(({ initials, label }) => (
          <Avatar
            key={label}
            size="sm"
            className="border-brand-primary bg-brand-primary-pale border-[3px]"
            aria-label={label}
          >
            <AvatarFallback
              className={
                size === 'sm' ? 'text-[10px] font-bold' : 'text-xs font-bold'
              }
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <p className={`text-white ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
        <span className="font-extrabold">324 amigos</span>
        <span className="font-normal"> na sua cidade</span>
      </p>
    </div>
  )
}

export function HeroSection() {
  return (
    <section
      data-slot="hero-section"
      className="bg-brand-primary overflow-hidden"
    >
      {/* ── Desktop layout (md+) ── */}
      <div className="mx-auto hidden max-w-7xl items-end gap-12 px-10 md:flex lg:px-20">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-8 pt-12 pb-20">
          <Reveal wipeColor="bg-brand-primary" delay={0}>
            <SocialProof />
          </Reveal>

          <Reveal wipeColor="bg-brand-primary" delay={0.15} className="w-full">
            <h1 className="text-hero text-white">
              Leve
              <br />a felicidade
              <br />
              para o seu lar
            </h1>
          </Reveal>

          <Reveal wipeColor="bg-brand-primary" delay={0.3} className="w-full">
            <p className="text-subheading text-white">
              Encontre o animal de estimação ideal
              <br />
              para seu estilo de vida!
            </p>
          </Reveal>
        </div>

        {/* Right column — interactive phone card */}
        <PhoneCard />
      </div>

      {/* ── Mobile layout (< md) ── */}
      <div className="md:hidden">
        {/* Content area */}
        <div className="flex flex-col gap-5 px-5 pt-8 pb-6">
          <Reveal wipeColor="bg-brand-primary" delay={0}>
            <SocialProof size="sm" />
          </Reveal>

          <Reveal wipeColor="bg-brand-primary" delay={0.15} className="w-full">
            <h1 className="text-hero text-white">
              Leve
              <br />a felicidade
              <br />
              para o seu lar
            </h1>
          </Reveal>
        </div>

        {/* Card carousel */}
        <div className="relative h-[310px] overflow-hidden">
          {/* Left partial decorative card — translate keeps it out of layout flow */}
          <div className="rounded-card bg-brand-primary-dark absolute top-5.5 left-0 h-63.75 w-69.75 -translate-x-[70%]" />

          {/* Center card with dog */}
          <div className="absolute top-0 left-1/2 z-10 w-69.75 -translate-x-1/2">
            <div
              className="rounded-card relative h-63.75 overflow-hidden"
              style={{
                background:
                  'linear-gradient(155.12deg, #f36a6f 17.228%, #e44449 73.769%)',
              }}
            >
              <Image
                src="/images/hero-pets.png"
                alt="Animal aguardando adoção"
                fill
                priority
                className="object-contain"
              />

              <Link
                href="/pets"
                className="text-accent-navy focus-visible:ring-ring absolute bottom-4 left-1/2 flex h-[55px] w-[239px] -translate-x-1/2 items-center justify-center rounded-[8.659px] bg-white text-sm font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:outline-none"
              >
                Acesse agora
              </Link>
            </div>
          </div>

          {/* Right partial decorative card — translate keeps it out of layout flow */}
          <div className="rounded-card bg-brand-primary-dark absolute top-5.5 right-0 h-63.75 w-69.75 translate-x-[70%]" />
        </div>

        {/* Bottom spacing */}
        <div className="h-10" />
      </div>
    </section>
  )
}
