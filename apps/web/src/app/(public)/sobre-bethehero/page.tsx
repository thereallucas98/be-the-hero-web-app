import type { Metadata } from 'next'
import { AboutSection } from '~/components/features/landing/about-section'
import { ContactSection } from '~/components/features/landing/contact-section'

export const metadata: Metadata = {
  title: 'Sobre o BeTheHero',
  description:
    'Conheça a plataforma BeTheHero — uma iniciativa que conecta ONGs, clínicas veterinárias e petshops a pessoas dispostas a adotar com responsabilidade.',
}

export default function SobreBeTheHeroPage() {
  return (
    <>
      <AboutSection />
      <ContactSection />
    </>
  )
}
