import Link from 'next/link'
import { Reveal } from '~/components/ui/reveal'
import { PetCarousel } from './pet-carousel'

export function CtaSection() {
  return (
    <section data-slot="cta-section" className="bg-background py-12 md:py-20">
      {/* Red card with horizontal margin matching Figma (20px mobile / ~112px desktop) */}
      <div className="bg-brand-primary mx-5 rounded-[20px] px-8 py-12 md:mx-14 md:px-24 md:py-16 lg:mx-auto lg:max-w-304">
        {/* ── Desktop layout (md+) ── */}
        <div className="hidden items-start gap-6 md:flex">
          {/* Left — title + CTA */}
          <div className="flex w-104 shrink-0 flex-col gap-10">
            <Reveal wipeColor="bg-brand-primary" delay={0.1} className="w-full">
              <h2 className="font-nunito text-accent-yellow text-[48px] leading-[0.9] font-bold tracking-[-0.96px]">
                Há muitos amigos esperando por você!
              </h2>
            </Reveal>
            <Link
              href="/pets"
              className="text-accent-navy flex h-18 w-57.75 items-center justify-center rounded-[20px] bg-white text-xl font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
            >
              Acesse agora
            </Link>
          </div>

          {/* Right — description + carousel */}
          <div className="flex flex-1 flex-col gap-8">
            <Reveal
              wipeColor="bg-brand-primary"
              delay={0.25}
              className="w-full"
            >
              <p className="font-nunito text-xl leading-[1.1] tracking-[-0.4px] text-white">
                O BeTheHero conecta pessoas que estão procurando por um animal
                de estimação com animais que precisam de um lar amoroso. É fácil
                de usar e você pode navegar por uma variedade de animais para
                encontrar aquele que melhor se adapta ao seu estilo de vida e
                necessidades.
              </p>
            </Reveal>
            <PetCarousel />
          </div>
        </div>

        {/* ── Mobile layout (< md) ── */}
        <div className="flex flex-col gap-6 text-center md:hidden">
          <Reveal wipeColor="bg-brand-primary" delay={0.1} className="w-full">
            <h2 className="font-nunito text-accent-yellow text-[30px] leading-[0.9] font-bold tracking-[-0.6px]">
              Há muitos amigos esperando por você!
            </h2>
          </Reveal>
          <Reveal wipeColor="bg-brand-primary" delay={0.25} className="w-full">
            <p className="font-nunito text-base leading-[1.1] tracking-[-0.32px] text-white">
              O BeTheHero conecta pessoas que estão procurando por um animal de
              estimação com animais que precisam de um lar amoroso. É fácil de
              usar e você pode navegar por uma variedade de animais para
              encontrar aquele que melhor se adapta ao seu estilo de vida e
              necessidades.
            </p>
          </Reveal>
          <Link
            href="/pets"
            className="text-accent-navy mx-auto flex h-13.75 w-64 items-center justify-center rounded-[9px] bg-white text-sm font-extrabold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            Acesse agora
          </Link>
          <PetCarousel />
        </div>
      </div>
    </section>
  )
}
