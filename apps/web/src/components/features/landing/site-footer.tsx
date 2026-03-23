import { Logo } from '~/components/ui/logo'

export function SiteFooter() {
  return (
    <footer
      data-slot="site-footer"
      className="bg-brand-primary-dark px-5 py-7 md:px-10 lg:px-20"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <Logo className="text-white" />
        <p className="font-nunito text-sm text-white/80">
          2024 © BeTheHero &nbsp;&nbsp; All rights reserved
        </p>
      </div>
    </footer>
  )
}
