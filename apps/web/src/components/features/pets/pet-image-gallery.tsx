'use client'

import { useState } from 'react'
import { cn } from '~/lib/utils'
import { LogoIcon } from '~/components/ui/logo'

interface PetImage {
  id: string
  url: string
  position: number
  isCover: boolean
}

interface PetImageGalleryProps {
  images: PetImage[]
  petName: string
}

export function PetImageGallery({ images, petName }: PetImageGalleryProps) {
  const sorted = [...images].sort((a, b) => a.position - b.position)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selected = sorted[selectedIndex]

  return (
    <div data-slot="pet-image-gallery">
      {/* Hero image */}
      <div
        className="bg-brand-primary-pale relative w-full overflow-hidden rounded-t-[20px]"
        style={{ aspectRatio: '704 / 336' }}
      >
        {selected ? (
          <img
            src={selected.url}
            alt={petName}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center">
            <LogoIcon className="text-brand-primary/20 size-16" />
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {sorted.length > 0 && (
        <div className="flex gap-3 px-5 pt-4 pb-2 sm:gap-4 sm:px-6">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(i)}
              aria-label={`Ver foto ${i + 1} de ${petName}`}
              className={cn(
                'focus-visible:ring-accent-navy relative size-[60px] shrink-0 cursor-pointer overflow-hidden rounded-[12px] transition-opacity focus-visible:ring-2 focus-visible:outline-none sm:size-[72px] sm:rounded-[14px]',
                i === selectedIndex
                  ? 'border-accent-navy border-[3px] opacity-100'
                  : 'opacity-30 hover:opacity-60',
              )}
            >
              <img
                src={img.url}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
