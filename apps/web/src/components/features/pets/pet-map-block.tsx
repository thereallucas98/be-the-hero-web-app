import { MapPin } from 'lucide-react'

interface PetMapBlockProps {
  /** Google Maps search query (e.g., the workspace address) */
  query: string | null
}

export function PetMapBlock({ query }: PetMapBlockProps) {
  const mapsUrl = query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
    : 'https://www.google.com/maps'

  return (
    <div data-slot="pet-map-block" className="overflow-hidden rounded-[20px]">
      {/* Map image area */}
      <div
        className="bg-brand-primary-pale relative"
        style={{ aspectRatio: '560 / 200' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-accent-navy/30 flex flex-col items-center gap-2">
            <MapPin className="size-10" aria-hidden />
          </div>
        </div>
      </div>

      {/* "Ver rotas" footer */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-nunito bg-accent-navy text-accent-yellow flex items-center justify-center py-4 text-[16px] font-bold transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:text-[18px]"
      >
        Ver rotas no Google Maps
      </a>
    </div>
  )
}
