import Image from 'next/image'
import { Reveal } from '~/components/ui/reveal'
import { cn } from '~/lib/utils'

const FEATURES = [
  {
    emoji: '🐕',
    text: 'O <strong>BeTheHero</strong> é um produto desenvolvido para você encontrar o animal de estimação ideal ao seu estilo de vida!',
    wide: false,
  },
  {
    emoji: '🐈',
    text: '<strong>ONGs</strong> cadastram os bichinhos disponíveis para adoção informando características como: porte, nível de energia, nível de independência, sociabilidade e gênero.',
    wide: false,
  },
  {
    emoji: '🦮',
    text: '<strong>Filtre os bichinhos</strong> de acordo com suas preferências e lifestyle. Depois é só entrar em contato com a ONG para agendar uma visita e conhecer pessoalmente seu <strong>match perfeito!</strong>',
    wide: true,
  },
]

interface FeatureCardProps {
  emoji: string
  text: string
  className?: string
}

function FeatureCard({ emoji, text, className }: FeatureCardProps) {
  return (
    <div
      data-slot="feature-card"
      className={cn(
        'rounded-card border-brand-primary/30 bg-brand-primary-pale/50 flex flex-col gap-4 border p-6',
        className,
      )}
    >
      <span className="text-[30px] leading-none" aria-hidden="true">
        {emoji}
      </span>
      <p
        className="text-foreground text-sm leading-relaxed"
        dangerouslySetInnerHTML={{ __html: text }}
      />
    </div>
  )
}

export function FeaturesSection() {
  return (
    <section
      data-slot="features-section"
      className="bg-background py-16 md:py-24"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10 lg:px-20">
        {/* ── Desktop layout (md+) ── */}
        <div className="hidden items-center gap-12 md:flex lg:gap-20">
          {/* Left — app mockup */}
          <div className="relative w-105 shrink-0 xl:w-120">
            <Image
              src="/images/app-mockup.png"
              alt="App BeTheHero exibindo lista de animais para adoção"
              width={480}
              height={580}
              className="rounded-card h-auto w-full object-contain"
            />
          </div>

          {/* Right — title + feature cards */}
          <div className="flex flex-1 flex-col gap-10">
            <Reveal wipeColor="bg-background" delay={0.1} className="w-full">
              <h2 className="text-section-title text-accent-navy">
                Um app não,
                <br />
                uma caixinha de amigos...
              </h2>
            </Reveal>

            <div className="grid grid-cols-2 gap-4">
              {FEATURES.filter((f) => !f.wide).map(({ emoji, text }) => (
                <FeatureCard key={emoji} emoji={emoji} text={text} />
              ))}
              {FEATURES.filter((f) => f.wide).map(({ emoji, text }) => (
                <FeatureCard
                  key={emoji}
                  emoji={emoji}
                  text={text}
                  className="col-span-2"
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Mobile layout (< md) ── */}
        <div className="flex flex-col gap-8 md:hidden">
          <Reveal wipeColor="bg-background" delay={0.1} className="w-full">
            <h2 className="text-section-title text-accent-navy">
              Um app não, uma caixinha de amigos...
            </h2>
          </Reveal>

          <div className="flex flex-col gap-4">
            {FEATURES.map(({ emoji, text }) => (
              <FeatureCard key={emoji} emoji={emoji} text={text} />
            ))}
          </div>

          {/* App mockup at bottom on mobile */}
          <div className="relative mx-auto w-full max-w-xs">
            <Image
              src="/images/app-mockup.png"
              alt="App BeTheHero exibindo lista de animais para adoção"
              width={320}
              height={390}
              className="rounded-card h-auto w-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
