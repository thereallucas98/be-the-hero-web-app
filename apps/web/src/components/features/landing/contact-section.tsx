import Image from 'next/image'
import { Reveal } from '~/components/ui/reveal'

// ─── Shared dog layers rendered on the isometric card surface ───────────────
// Each layer uses explicit top/right/bottom/left so the wrapper <div> (block element)
// gets deterministic dimensions — identical to the Figma output structure.
// Applying inset directly to <img> (replaced element) lets the browser use the
// intrinsic aspect-ratio instead, causing visible stretching.
const DOG_LAYERS = [
  {
    src: '/images/contact/dog-1.svg',
    top: '12.62%',
    right: '63.7%',
    bottom: '0',
    left: '15.09%',
  },
  {
    src: '/images/contact/dog-2.svg',
    top: '24.43%',
    right: '0',
    bottom: '0',
    left: '80.06%',
  },
  {
    src: '/images/contact/dog-3.svg',
    top: '38.73%',
    right: '19.64%',
    bottom: '0',
    left: '64.65%',
  },
  {
    src: '/images/contact/dog-4.svg',
    top: '0',
    right: '32.73%',
    bottom: '0',
    left: '45.9%',
  },
  {
    src: '/images/contact/dog-5.svg',
    top: '46.59%',
    right: '49.96%',
    bottom: '0',
    left: '27.58%',
  },
  {
    src: '/images/contact/dog-6.svg',
    top: '53.78%',
    right: '81.95%',
    bottom: '0',
    left: '0',
  },
]

interface DogSurfaceProps {
  width: number
  height: number
  borderRadius: number
}

/** Counter-transformed surface that shows dogs upright on the isometric card */
function DogSurface({ width, height, borderRadius }: DogSurfaceProps) {
  return (
    <div
      className="relative overflow-clip"
      style={{ width, height, borderRadius }}
    >
      {DOG_LAYERS.map((layer) => (
        // Wrapper div: block element → dimensions = (parent − inset) deterministically
        // img inside: fills wrapper with size-full — matches Figma's exact node structure
        <div
          key={layer.src}
          className="absolute"
          style={{
            top: layer.top,
            right: layer.right,
            bottom: layer.bottom,
            left: layer.left,
          }}
        >
          <img
            src={layer.src}
            alt=""
            className="absolute block size-full max-w-none"
          />
        </div>
      ))}
    </div>
  )
}

// ─── Isometric phone card pieces ─────────────────────────────────────────────
// All pixel values come directly from Figma nodes 57:43 (front) and 57:177 (back).
// The clip containers use overflow-clip to reproduce the frame crop from Figma.

/** Front card — large, positioned at right edge, overflows 40px above the navy card */
function FrontCard() {
  return (
    // Clip frame: 720 × 465, left=511 from section left, top=−40 from section top
    <div
      className="absolute overflow-clip"
      style={{ left: 511, top: -40, width: 720, height: 465 }}
      aria-hidden="true"
    >
      {/* Drop-shadow / union shape */}
      <img
        src="/images/contact/union-front.svg"
        alt=""
        className="absolute"
        style={{ width: 741, height: 428, left: 10.48, top: 37.01 }}
      />

      {/* Isometric card body — red rounded rect, skewed into perspective */}
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 763, height: 441, left: -0.4, top: -5 }}
      >
        <div style={{ transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)' }}>
          <div
            className="bg-brand-primary"
            style={{ width: 374, height: 507, borderRadius: 21 }}
          />
        </div>
      </div>

      {/* Dog illustration — counter-transformed to appear upright on card surface */}
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 536, height: 310, left: 152, top: 83 }}
      >
        <div style={{ transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)' }}>
          <DogSurface width={411} height={209} borderRadius={32} />
        </div>
      </div>
    </div>
  )
}

/** Back card — smaller, visible only as a bottom strip at the left of the section */
function BackCard() {
  return (
    // Clip frame: 763 × 217, left=97 from section left, top=0
    <div
      className="absolute overflow-clip"
      style={{ left: 97, top: 0, width: 763, height: 217 }}
      aria-hidden="true"
    >
      {/* Drop-shadow — offset so the card body aligns to the crop */}
      <img
        src="/images/contact/union-back.svg"
        alt=""
        className="absolute"
        style={{ width: 741, height: 428, left: 10.48, top: -240 }}
      />

      {/* Card body */}
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 763, height: 441, left: -0.4, top: -282 }}
      >
        <div style={{ transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)' }}>
          <div
            className="bg-brand-primary"
            style={{ width: 374, height: 507, borderRadius: 21 }}
          />
        </div>
      </div>

      {/* Dog illustration */}
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 536, height: 310, left: 152, top: -194 }}
      >
        <div style={{ transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)' }}>
          <DogSurface width={411} height={209} borderRadius={32} />
        </div>
      </div>
    </div>
  )
}

// ─── Mobile mini card (top-right corner of mobile block) ─────────────────────
function MiniCard() {
  return (
    <div
      className="pointer-events-none absolute overflow-clip"
      style={{ right: 0, top: 0, width: 194, height: 136 }}
      aria-hidden="true"
    >
      <img
        src="/images/contact/union-front.svg"
        alt=""
        className="absolute"
        style={{ width: 215, height: 124, left: 3, top: 12 }}
      />
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 221, height: 127, left: -0.4, top: 0 }}
      >
        <div style={{ transform: 'rotate(30deg) skewX(-30deg) scaleY(0.87)' }}>
          <div
            className="bg-brand-primary"
            style={{ width: 108, height: 147, borderRadius: 6 }}
          />
        </div>
      </div>
      <div
        className="absolute flex items-center justify-center"
        style={{ width: 155, height: 90, left: 44, top: 26 }}
      >
        <div style={{ transform: 'rotate(-30deg) skewX(30deg) scaleY(0.87)' }}>
          <DogSurface width={119} height={60} borderRadius={9} />
        </div>
      </div>
    </div>
  )
}

// ─── Text content (shared copy) ───────────────────────────────────────────────
function ContactText({
  headingSize,
  bodySize,
  iconSize,
  wipeColor,
}: {
  headingSize: string
  bodySize: string
  iconSize: number
  wipeColor: string
}) {
  return (
    <>
      <Reveal wipeColor={wipeColor} delay={0.1}>
        <h2
          className={`font-nunito leading-[0.9] font-bold tracking-[-0.96px] text-white ${headingSize}`}
        >
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
          width={iconSize}
          height={iconSize}
          aria-hidden
        />
        <span
          className={`font-nunito text-accent-yellow leading-[1.1] tracking-[-0.4px] ${bodySize}`}
        >
          Clique aqui e envie um email
        </span>
      </a>
    </>
  )
}

// ─── Section ──────────────────────────────────────────────────────────────────
export function ContactSection() {
  return (
    <section
      data-slot="contact-section"
      className="bg-background overflow-hidden py-12 md:py-20"
    >
      <div className="mx-5 md:mx-14 lg:mx-auto lg:max-w-[1231px]">
        {/* ── Desktop (md+) ──────────────────────────────────────────────────
            height: 465   → full front-card height (720×465 clip)
            paddingTop: 40 → space for front card peeking 40px above navy card
            overflow: visible → front card floats below navy card (86px)
            section overflow-hidden above clips right-side at narrow widths    ── */}
        <div
          className="relative hidden md:block"
          style={{ height: 465, paddingTop: 40 }}
        >
          {/* Navy card — no overflow-hidden so FrontCard can peek above */}
          <div
            className="bg-accent-navy relative rounded-[20px]"
            style={{ height: 339 }}
          >
            <BackCard />
            <FrontCard />

            {/* Text — Figma: left=216−112=104, top=715−641=74 */}
            <div
              className="absolute z-10 flex flex-col gap-6"
              style={{ left: 104, top: 74 }}
            >
              <ContactText
                headingSize="text-[48px]"
                bodySize="text-xl"
                iconSize={33}
                wipeColor="bg-accent-navy"
              />
            </div>
          </div>
        </div>

        {/* ── Mobile (< md) ─────────────────────────────────────────────── */}
        <div className="bg-accent-navy relative overflow-hidden rounded-[10px] px-8 pt-6 pb-10 md:hidden">
          <MiniCard />
          <div className="mt-16 flex flex-col gap-6">
            <ContactText
              headingSize="text-[30px] leading-[1.1] tracking-[-0.6px]"
              bodySize="text-sm tracking-[-0.28px]"
              iconSize={20}
              wipeColor="bg-accent-navy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
