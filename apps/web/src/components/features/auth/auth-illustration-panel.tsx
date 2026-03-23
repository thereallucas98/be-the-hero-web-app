import { Logo } from '~/components/ui/logo'

// Figma OBJECTS node (1213:221) — each entry: [src, top%, right%, bottom%, left%]
// Reference frame: 384 × 195 px container, centered within the card
const ANIMALS: [string, string, string, string, string][] = [
  ['/assets/illustrations/auth/dog-4.svg', '0%', '32.73%', '0%', '45.9%'],
  ['/assets/illustrations/auth/dog-1.svg', '12.62%', '63.7%', '0%', '15.09%'],
  ['/assets/illustrations/auth/dog-3.svg', '38.73%', '19.64%', '0%', '64.65%'],
  ['/assets/illustrations/auth/dog-5.svg', '46.59%', '49.96%', '0%', '27.58%'],
  ['/assets/illustrations/auth/dog-6.svg', '53.78%', '81.95%', '0%', '0%'],
  ['/assets/illustrations/auth/dog-2.svg', '24.43%', '0%', '0%', '80.06%'],
]

function AnimalsGroup() {
  return (
    // Figma: OBJECTS is 384 wide inside 488 card → ~78.7% wide, centered (≈10.7% each side)
    // We reproduce this as mx-auto with a proportional max-width, bottom-anchored
    <div
      className="relative w-full"
      style={{ aspectRatio: '384 / 195' }}
      aria-hidden
    >
      {ANIMALS.map(([src, top, right, bottom, left]) => (
        <div
          key={src}
          className="absolute"
          style={{ top, right, bottom, left }}
        >
          <img src={src} alt="" className="block size-full max-w-none" />
        </div>
      ))}
    </div>
  )
}

export function AuthIllustrationPanel() {
  return (
    <div
      data-slot="auth-illustration-panel"
      className="bg-brand-primary relative flex h-full flex-col overflow-hidden rounded-[20px]"
    >
      {/* Logo — centered horizontally, padded from top */}
      <div className="flex justify-center pt-10">
        <Logo className="text-white" />
      </div>

      {/* Spacer pushes animals to the bottom */}
      <div className="flex-1" />

      {/* Animals — flush to bottom, padded symmetrically on sides like Figma */}
      <div className="px-[10.7%]">
        <AnimalsGroup />
      </div>
    </div>
  )
}
