'use client'

import { Loader, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface SubmitForReviewButtonProps {
  petId: string
  status: string
  imageCount: number
}

export function SubmitForReviewButton({
  petId,
  status,
  imageCount,
}: SubmitForReviewButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (status !== 'DRAFT' && status !== 'REJECTED') return null

  const canSubmit = imageCount > 0

  async function handleSubmit() {
    if (!canSubmit) {
      toast.error('Adicione pelo menos uma foto antes de enviar para revisão.')
      return
    }

    setLoading(true)
    const res = await fetch(`/api/pets/${petId}/submit-for-review`, {
      method: 'POST',
    })
    setLoading(false)

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      const code = body?.message ?? ''
      const msg =
        code === 'INVALID_DATA'
          ? 'Dados incompletos. Verifique nome, espécie, tamanho e sexo.'
          : code === 'INVALID_IMAGES'
            ? 'É necessário ter pelo menos 1 foto com capa definida.'
            : code === 'WORKSPACE_BLOCKED'
              ? 'Workspace bloqueado. Contate o suporte.'
              : 'Erro ao enviar para revisão. Tente novamente.'
      toast.error(msg)
      return
    }

    toast.success('Pet enviado para revisão!')
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={() => handleSubmit()}
      disabled={loading || !canSubmit}
      title={!canSubmit ? 'Adicione pelo menos uma foto primeiro' : undefined}
      className="font-nunito bg-accent-navy flex h-[48px] shrink-0 cursor-pointer items-center gap-2 rounded-[14px] px-6 text-[15px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
    >
      {loading ? (
        <Loader className="size-4 animate-spin" aria-hidden />
      ) : (
        <Send className="size-4" aria-hidden />
      )}
      {status === 'REJECTED' ? 'Reenviar para revisão' : 'Enviar para revisão'}
    </button>
  )
}
