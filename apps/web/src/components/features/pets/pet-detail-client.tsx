'use client'

import { Check, Heart, Loader } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface PetDetailClientProps {
  petId: string
  waUrl: string | null
  userRole: string | null
  alreadyInterested: boolean
}

function trackEvent(petId: string, type: 'VIEW_PET' | 'CLICK_WHATSAPP') {
  fetch(`/api/pets/${petId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type }),
  }).catch(() => {})
}

export function PetDetailClient({
  petId,
  waUrl,
  userRole,
  alreadyInterested,
}: PetDetailClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(alreadyInterested)

  useEffect(() => {
    trackEvent(petId, 'VIEW_PET')
  }, [petId])

  async function handleAdoptClick() {
    if (userRole === null) {
      router.push(`/login?redirectTo=/pets/${petId}`)
      return
    }

    setLoading(true)
    const res = await fetch(`/api/pets/${petId}/interests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    })
    setLoading(false)

    if (res.ok) {
      setSubmitted(true)
      toast.success('Interesse registrado! A organização entrará em contato.')
      return
    }

    const body = (await res.json().catch(() => null)) as {
      message?: string
    } | null

    if (res.status === 409) {
      toast.error('Você já registrou interesse neste animal.')
      setSubmitted(true)
      return
    }

    toast.error(
      body?.message ?? 'Erro ao registrar interesse. Tente novamente.',
    )
  }

  const isGuardian = userRole === 'GUARDIAN'
  const isOtherRole = userRole !== null && !isGuardian

  return (
    <div className="flex flex-col gap-3">
      {/* WhatsApp CTA */}
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent(petId, 'CLICK_WHATSAPP')}
          className="font-nunito flex w-full items-center justify-center gap-3 rounded-[20px] bg-[#3cdc8c] py-4 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-[#3cdc8c] focus-visible:outline-none sm:py-5 sm:text-[18px]"
        >
          <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-hidden>
            <path d="M12.004 2C6.479 2 2 6.479 2 12.004c0 1.765.463 3.423 1.27 4.87L2 22l5.264-1.246A9.958 9.958 0 0 0 12.004 22C17.525 22 22 17.525 22 12.004 22 6.479 17.525 2 12.004 2Zm5.77 13.944c-.243.684-1.204 1.252-1.97 1.418-.524.112-1.208.2-3.51-.753-2.944-1.198-4.839-4.186-4.986-4.38-.142-.195-1.191-1.584-1.191-3.022 0-1.438.751-2.141 1.018-2.435.243-.268.528-.336.705-.336l.508.01c.163.007.38-.062.595.454.222.53.754 1.835.82 1.969.067.133.11.29.022.466-.086.177-.13.287-.258.44-.13.153-.272.342-.388.46-.13.128-.265.267-.114.523.151.255.672 1.11 1.444 1.797.992.886 1.829 1.16 2.086 1.294.257.133.407.111.558-.067.151-.177.648-.756.82-1.014.171-.258.343-.214.578-.129.236.085 1.499.708 1.756.836.257.13.428.193.49.3.063.11.063.635-.18 1.32Z" />
          </svg>
          Entrar em contato
        </a>
      ) : (
        <div className="font-nunito bg-accent-navy/10 text-accent-navy/50 flex w-full items-center justify-center rounded-[20px] py-4 text-[16px] font-semibold sm:py-5 sm:text-[18px]">
          Contato não disponível
        </div>
      )}

      {/* Adopt interest button */}
      <button
        type="button"
        onClick={handleAdoptClick}
        disabled={loading || submitted || isOtherRole}
        title={
          isOtherRole ? 'Apenas guardiões podem registrar interesse' : undefined
        }
        className="font-nunito text-brand-primary ring-brand-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-[20px] bg-white py-4 text-[16px] font-extrabold ring-2 transition-opacity ring-inset hover:opacity-80 focus-visible:ring-[#f15156] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 sm:py-5 sm:text-[18px]"
      >
        {loading ? (
          <Loader className="size-5 animate-spin" aria-hidden />
        ) : submitted ? (
          <Check className="size-5" aria-hidden />
        ) : (
          <Heart className="size-5" aria-hidden />
        )}
        {loading
          ? 'Aguarde...'
          : submitted
            ? 'Interesse registrado'
            : 'Quero adotar'}
      </button>
    </div>
  )
}
