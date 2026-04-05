'use client'

import { Loader, Plus, Star, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { LogoIcon } from '~/components/ui/logo'
import { cn } from '~/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetImage {
  id: string
  url: string
  position: number
  isCover: boolean
}

interface PetImageManagerProps {
  petId: string
  initialImages: PetImage[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PetImageManager({
  petId,
  initialImages,
}: PetImageManagerProps) {
  const router = useRouter()
  const [images, setImages] = useState<PetImage[]>(initialImages)
  const [addUrl, setAddUrl] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const canAdd = images.length < 5

  // ── Add image ──────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addUrl.trim()) return

    let url: string
    try {
      url = new URL(addUrl.trim()).toString()
    } catch {
      toast.error('URL inválida. Use um link completo (https://...).')
      return
    }

    setAdding(true)
    const nextPosition =
      images.length > 0 ? Math.max(...images.map((i) => i.position)) + 1 : 1
    const isFirst = images.length === 0

    const res = await fetch(`/api/pets/${petId}/images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        storagePath: `pets/${petId}/img-${Date.now()}`,
        position: nextPosition,
        isCover: isFirst,
      }),
    })
    setAdding(false)

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      toast.error(body?.message ?? 'Erro ao adicionar imagem.')
      return
    }

    const newImage = (await res.json()) as PetImage
    setImages((prev) => [...prev, newImage])
    setAddUrl('')
    setShowAddForm(false)
    router.refresh()
    toast.success('Imagem adicionada!')
  }

  // ── Set cover ──────────────────────────────────────────────────────────────
  async function handleSetCover(imageId: string) {
    setLoadingId(imageId)
    const res = await fetch(`/api/pets/${petId}/images/${imageId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isCover: true }),
    })
    setLoadingId(null)

    if (!res.ok) {
      toast.error('Erro ao definir capa.')
      return
    }

    setImages((prev) =>
      prev.map((img) => ({ ...img, isCover: img.id === imageId })),
    )
    router.refresh()
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(imageId: string) {
    setLoadingId(imageId)
    const res = await fetch(`/api/pets/${petId}/images/${imageId}`, {
      method: 'DELETE',
    })
    setLoadingId(null)

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      const msg =
        body?.message === 'Cannot remove the last image of a pet under review'
          ? 'Não é possível remover a única imagem de um pet em revisão.'
          : 'Erro ao remover imagem.'
      toast.error(msg)
      return
    }

    setImages((prev) => prev.filter((img) => img.id !== imageId))
    router.refresh()
    toast.success('Imagem removida.')
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Image grid ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {images
          .sort((a, b) => a.position - b.position)
          .map((img) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-[12px] border border-[#d3e2e5] bg-[#f5f8fa]"
              style={{ aspectRatio: '1 / 1' }}
            >
              <img
                src={img.url}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />

              {/* Cover badge */}
              {img.isCover && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5">
                  <Star
                    className="fill-accent-yellow text-accent-yellow size-3"
                    aria-hidden
                  />
                  <span className="font-nunito text-[10px] font-bold text-white">
                    Capa
                  </span>
                </div>
              )}

              {/* Hover overlay actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                {loadingId === img.id ? (
                  <Loader
                    className="size-5 animate-spin text-white"
                    aria-hidden
                  />
                ) : (
                  <>
                    {!img.isCover && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(img.id)}
                        aria-label="Definir como capa"
                        className="hover:bg-accent-yellow flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                      >
                        <Star className="size-4" aria-hidden />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(img.id)}
                      aria-label="Remover imagem"
                      className="hover:bg-destructive flex size-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

        {/* Empty slots */}
        {images.length === 0 && (
          <div
            className="flex items-center justify-center rounded-[12px] border border-dashed border-[#d3e2e5] bg-[#f5f8fa]"
            style={{ aspectRatio: '1 / 1' }}
          >
            <LogoIcon className="text-brand-primary/20 size-8" />
          </div>
        )}
      </div>

      {/* ── Add form ────────────────────────────────────────────────── */}
      {canAdd && (
        <div>
          {showAddForm ? (
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={addUrl}
                onChange={(e) => setAddUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAdd()
                  }
                  if (e.key === 'Escape') {
                    setShowAddForm(false)
                    setAddUrl('')
                  }
                }}
                placeholder="https://exemplo.com/imagem.jpg"
                autoFocus
                className={cn(
                  'font-nunito text-accent-navy flex-1 rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-2.5 text-[14px] font-semibold',
                  'placeholder:font-normal placeholder:text-[#8fa7b2]',
                  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:ring-2 focus-visible:ring-offset-0 focus-visible:outline-none',
                )}
              />
              <button
                type="button"
                onClick={() => handleAdd()}
                disabled={adding || !addUrl.trim()}
                className="font-nunito bg-accent-navy flex h-[42px] cursor-pointer items-center justify-center rounded-[10px] px-4 text-[14px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
              >
                {adding ? (
                  <Loader className="size-4 animate-spin" aria-hidden />
                ) : (
                  'Adicionar'
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false)
                  setAddUrl('')
                }}
                className="font-nunito text-accent-navy/50 hover:text-accent-navy px-2 text-[14px] transition-colors focus-visible:outline-none"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className={cn(
                'font-nunito text-accent-navy/60 hover:text-accent-navy hover:border-accent-navy flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d3e2e5] py-3 text-[14px] font-semibold transition-colors',
                'focus-visible:ring-accent-navy focus-visible:ring-2 focus-visible:outline-none',
              )}
            >
              <Plus className="size-4" aria-hidden />
              Adicionar imagem via URL
              <span className="font-normal text-[#8fa7b2]">
                ({images.length}/5)
              </span>
            </button>
          )}
        </div>
      )}

      {images.length === 5 && (
        <p className="font-nunito text-[13px] text-[#8fa7b2]">
          Limite de 5 imagens atingido.
        </p>
      )}
    </div>
  )
}
