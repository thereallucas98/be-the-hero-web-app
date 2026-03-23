import { AlertCircle } from 'lucide-react'

interface PetAdoptionRequirementProps {
  title: string
}

export function PetAdoptionRequirement({ title }: PetAdoptionRequirementProps) {
  return (
    <div
      data-slot="pet-adoption-requirement"
      className="border-brand-primary flex items-center gap-3 rounded-[10px] border px-4 py-[14px]"
      style={{
        background:
          'linear-gradient(173deg, rgba(247,95,96,0.10) 16%, rgba(241,81,86,0) 67%)',
      }}
    >
      <AlertCircle className="text-brand-primary size-5 shrink-0" aria-hidden />
      <p className="font-nunito text-brand-primary text-[15px] leading-snug font-semibold sm:text-[16px]">
        {title}
      </p>
    </div>
  )
}
