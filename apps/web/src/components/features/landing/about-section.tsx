import Image from 'next/image'
import { Reveal } from '~/components/ui/reveal'

const TEAM = [
  {
    name: 'Hamilton Freire',
    role: 'Fundador',
    photo: '/images/team/hamilton.png',
  },
  {
    name: 'Lara Valencia',
    role: 'Fundadora',
    photo: '/images/team/lara.png',
  },
  {
    name: 'Aline Alana',
    role: 'UI/UX Designer',
    photo: '/images/team/aline.png',
  },
  {
    name: 'Tadeu Bastos',
    role: 'Full stack developer',
    photo: '/images/team/tadeu.png',
  },
]

interface TeamCardProps {
  name: string
  role: string
  photo: string
}

function TeamCard({ name, role, photo }: TeamCardProps) {
  return (
    <div
      data-slot="team-card"
      className="border-brand-primary/30 bg-brand-primary-pale/50 relative h-71 w-69.5 shrink-0 rounded-[20px] border"
    >
      {/* Photo */}
      <div className="absolute top-2.5 right-2.5 left-2.5 h-46.5 overflow-hidden rounded-2xl">
        <Image
          src={photo}
          alt={name}
          fill
          className="object-cover object-top"
        />
      </div>

      {/* Name + role */}
      <div className="absolute right-0 bottom-0 left-0 flex flex-col items-center gap-0.5 pt-2 pb-5">
        <p className="font-nunito text-accent-navy text-[18px] leading-[1.2] font-bold">
          {name}
        </p>
        <p className="font-nunito text-accent-navy text-[18px] leading-[1.2] font-normal">
          {role}
        </p>
      </div>
    </div>
  )
}

export function AboutSection() {
  return (
    <section data-slot="about-section" className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-20">
        {/* ── Header ── */}
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-start md:gap-16">
          {/* Title */}
          <Reveal
            wipeColor="bg-background"
            delay={0}
            className="w-full md:w-104 md:shrink-0"
          >
            <h2 className="font-nunito text-accent-navy text-[48px] leading-[0.9] font-bold tracking-[-0.96px]">
              Sobre a
              <br />
              BeTheHero
            </h2>
          </Reveal>

          {/* Description */}
          <Reveal wipeColor="bg-background" delay={0.2} className="w-full">
            <p className="font-nunito text-accent-navy text-xl leading-[1.1] tracking-[-0.4px]">
              O BeTheHero acredita que todo bichinho merece um lar amoroso e
              seguro. Por isso, criamos soluções que conectam ONGs, clínicas
              veterinárias e petshops a pessoas dispostas a adotar com
              responsabilidade — começando pela Paraíba.
            </p>
          </Reveal>
        </div>

        {/* ── Team cards — Desktop (md+): 4 in a row ── */}
        <div className="hidden justify-between md:flex">
          {TEAM.map((member) => (
            <TeamCard key={member.name} {...member} />
          ))}
        </div>

        {/* ── Team cards — Mobile: horizontal scroll ── */}
        <div className="overflow-x-auto pb-2 md:hidden">
          <div className="flex gap-4">
            {TEAM.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
