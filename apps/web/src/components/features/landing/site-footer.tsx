import {
  FooterCopyright,
  FooterLogo,
  FooterVisibilityWrapper,
} from '~/components/features/nav/route-aware-logo'

export function SiteFooter() {
  return (
    <FooterVisibilityWrapper>
      <footer
        data-slot="site-footer"
        className="bg-brand-primary-dark px-5 py-7 md:px-10 lg:px-20"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <FooterLogo />
          <FooterCopyright />
        </div>
      </footer>
    </FooterVisibilityWrapper>
  )
}
