import Image from 'next/image'
import { Reveal } from '~/components/ui/reveal'

/** Isometric phone card with dog illustrations — matches the Figma design */
function PhoneIllustration({ className }: { className?: string }) {
  /** Shared dog layers used inside the isometric card surface */
  const DOG_LAYERS = [
    { src: '/images/contact/dog-1.svg', inset: '12.62% 63.7% 0 15.09%' },
    { src: '/images/contact/dog-2.svg', inset: '24.43% 0 0 80.06%' },
    { src: '/images/contact/dog-3.svg', inset: '38.73% 19.64% 0 64.65%' },
    { src: '/images/contact/dog-4.svg', inset: '0 32.73% 0 45.9%' },
    { src: '/images/contact/dog-5.svg', inset: '46.59% 49.96% 0 27.58%' },
    { src: '/images/contact/dog-6.svg', inset: '53.78% 81.95% 0 0' },
  ]

  return (
    <div
      className={`pointer-events-none select-none ${className ?? ''}`}
      aria-hidden="true"
    >
      {/* ─── Front card (large, top-right) ─── */}
      <div
        className="absolute overflow-clip"
        style={{ height: 465, width: 720, right: 0, top: -40 }}
      >
        {/* Perspective shadow */}
        <img
          src="/images/contact/union-front.svg"
          alt=""
          className="absolute"
          style={{ height: 428, width: 741, left: 10, top: 37 }}
        />

        {/* Isometric card body */}
        <div
          className="absolute flex items-center justify-center"
          style={{ height: 441, width: 763, left: -0.4, top: -5 }}
        >
          <div
            style={{
              transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)',
            }}
          >
            <div
              className="bg-brand-primary"
              style={{ height: 507, width: 374, borderRadius: 21 }}
            />
          </div>
        </div>

        {/* Dog illustrations — counter-transformed to appear upright on card surface */}
        <div
          className="absolute flex items-center justify-center"
          style={{ height: 310, width: 536, left: 152, top: 83 }}
        >
          <div
            style={{ transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)' }}
          >
            <div
              className="relative overflow-clip"
              style={{ height: 209, width: 411, borderRadius: 32 }}
            >
              {DOG_LAYERS.map((layer) => (
                <img
                  key={layer.src}
                  src={layer.src}
                  alt=""
                  className="absolute max-w-none"
                  style={{ inset: layer.inset }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Back card (smaller, bottom-left) ─── */}
      <div
        className="absolute overflow-clip"
        style={{ height: 217, width: 763, left: -430, top: 0 }}
      >
        {/* Perspective shadow */}
        <img
          src="/images/contact/union-back.svg"
          alt=""
          className="absolute"
          style={{ height: 428, width: 741, left: 10, top: -240 }}
        />

        {/* Card body */}
        <div
          className="absolute flex items-center justify-center"
          style={{ height: 441, width: 763, left: -0.4, top: -282 }}
        >
          <div
            style={{ transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)' }}
          >
            <div
              className="bg-brand-primary"
              style={{ height: 507, width: 374, borderRadius: 21 }}
            />
          </div>
        </div>

        {/* Dog illustrations (same set, partially visible) */}
        <div
          className="absolute flex items-center justify-center"
          style={{ height: 310, width: 536, left: 152, top: -194 }}
        >
          <div
            style={{ transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)' }}
          >
            <div
              className="relative overflow-clip"
              style={{ height: 209, width: 411, borderRadius: 32 }}
            >
              {DOG_LAYERS.map((layer) => (
                <img
                  key={layer.src}
                  src={layer.src}
                  alt=""
                  className="absolute max-w-none"
                  style={{ inset: layer.inset }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ContactSection() {
  return (
    <section
      data-slot="contact-section"
      className="bg-background py-12 md:py-20"
    >
      {/* Navy card — same margin pattern as CTA section */}
      <div className="bg-accent-navy relative mx-5 overflow-hidden rounded-[20px] md:mx-14 md:rounded-[20px] lg:mx-auto lg:max-w-304">
        {/* ── Desktop (md+) ── */}
        <div className="relative hidden h-[339px] items-center md:flex">
          {/* Left content */}
          <div className="z-10 flex flex-col gap-6 px-24 py-16">
            <Reveal wipeColor="bg-accent-navy" delay={0.1} className="w-full">
              <h2 className="font-nunito text-[48px] leading-[0.9] font-bold tracking-[-0.96px] text-white">
                Entre
                <br />
                em contato
                <br />
                conosco
              </h2>
            </Reveal>

            <a
              href="mailto:contato@bethehero.com.br"
              className="focus-visible:ring-accent-yellow flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Image
                src="/images/contact/message-icon.svg"
                alt=""
                width={33}
                height={33}
                aria-hidden="true"
              />
              <span className="font-nunito text-accent-yellow text-xl leading-[1.1] tracking-[-0.4px]">
                Clique aqui e envie um email
              </span>
            </a>
          </div>

          {/* Right — isometric illustration (overflows the card top) */}
          <div className="absolute inset-0 overflow-visible">
            <PhoneIllustration className="absolute top-0 right-0 h-full w-[720px]" />
          </div>
        </div>

        {/* ── Mobile (< md) ── */}
        <div className="relative overflow-hidden rounded-[10px] px-8 pt-6 pb-10 md:hidden">
          {/* Small illustration in top-right */}
          <div
            className="absolute overflow-clip"
            style={{ height: 136, width: 194, right: 0, top: 0 }}
            aria-hidden="true"
          >
            <img
              src="/images/contact/union-front.svg"
              alt=""
              className="absolute"
              style={{ height: 124, width: 215, left: 3, top: 12 }}
            />
            <div
              className="absolute flex items-center justify-center"
              style={{ height: 127, width: 221, left: -0.4, top: 0 }}
            >
              <div
                style={{
                  transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)',
                }}
              >
                <div
                  className="bg-brand-primary"
                  style={{ height: 147, width: 108, borderRadius: 6 }}
                />
              </div>
            </div>
            <div
              className="absolute flex items-center justify-center"
              style={{ height: 90, width: 155, left: 44, top: 26 }}
            >
              <div
                style={{
                  transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)',
                }}
              >
                <div
                  className="relative overflow-clip"
                  style={{ height: 60, width: 119, borderRadius: 9 }}
                >
                  {[
                    {
                      src: '/images/contact/dog-1.svg',
                      inset: '12.62% 63.7% 0 15.09%',
                    },
                    {
                      src: '/images/contact/dog-2.svg',
                      inset: '24.43% 0 0 80.06%',
                    },
                    {
                      src: '/images/contact/dog-3.svg',
                      inset: '38.73% 19.64% 0 64.65%',
                    },
                    {
                      src: '/images/contact/dog-4.svg',
                      inset: '0 32.73% 0 45.9%',
                    },
                    {
                      src: '/images/contact/dog-5.svg',
                      inset: '46.59% 49.96% 0 27.58%',
                    },
                    {
                      src: '/images/contact/dog-6.svg',
                      inset: '53.78% 81.95% 0 0',
                    },
                  ].map((layer) => (
                    <img
                      key={layer.src}
                      src={layer.src}
                      alt=""
                      className="absolute max-w-none"
                      style={{ inset: layer.inset }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="mt-16 flex flex-col gap-6">
            <Reveal wipeColor="bg-accent-navy" delay={0.1} className="w-full">
              <h2 className="font-nunito text-[30px] leading-[1.1] font-bold tracking-[-0.6px] text-white">
                Entre
                <br />
                em contato
                <br />
                conosco
              </h2>
            </Reveal>

            <a
              href="mailto:contato@bethehero.com.br"
              className="focus-visible:ring-accent-yellow flex items-center gap-2 transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none"
            >
              <Image
                src="/images/contact/message-icon.svg"
                alt=""
                width={20}
                height={20}
                aria-hidden="true"
              />
              <span className="font-nunito text-accent-yellow text-sm leading-[1.1] tracking-[-0.28px]">
                Clique aqui e envie um email
              </span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
