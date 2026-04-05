import { AboutSection } from '~/components/features/landing/about-section'
import { ContactSection } from '~/components/features/landing/contact-section'
import { CtaSection } from '~/components/features/landing/cta-section'
import { FeaturesSection } from '~/components/features/landing/features-section'
import { HeroSection } from '~/components/features/landing/hero-section'

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <CtaSection />
      <AboutSection />
      <ContactSection />
    </>
  )
}
