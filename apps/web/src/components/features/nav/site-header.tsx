import { MobileMenuTrigger } from './mobile-menu-trigger'
import { HeaderLogo } from './route-aware-logo'

export function SiteHeader() {
  return (
    <header
      data-slot="site-header"
      className="bg-brand-primary-dark md:bg-brand-primary relative z-50 px-5 py-4 md:px-10 lg:px-20"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <HeaderLogo />
        <MobileMenuTrigger />
      </div>
    </header>
  )
}
