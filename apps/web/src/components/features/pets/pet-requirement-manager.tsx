'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '~/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { cn } from '~/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetRequirement {
  id: string
  category: string
  title: string
  description: string | null
  isMandatory: boolean
  order: number
}

interface PetRequirementManagerProps {
  petId: string
  initialRequirements: PetRequirement[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<string, string> = {
  HOME: 'Lar',
  EXPERIENCE: 'Experiência',
  TIME_AVAILABILITY: 'Disponibilidade',
  FINANCIAL: 'Financeiro',
  SAFETY: 'Segurança',
  HEALTH_CARE: 'Saúde',
  OTHER: 'Outro',
}

const inputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-2.5 text-[14px] font-semibold',
  'placeholder:text-[#8fa7b2] placeholder:font-normal',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

// ─── Component ────────────────────────────────────────────────────────────────

export function PetRequirementManager({
  petId,
  initialRequirements,
}: PetRequirementManagerProps) {
  const router = useRouter()
  const [requirements, setRequirements] =
    useState<PetRequirement[]>(initialRequirements)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCategory, setEditCategory] = useState('OTHER')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Add form state ──
  const [showAdd, setShowAdd] = useState(false)
  const [addTitle, setAddTitle] = useState('')
  const [addCategory, setAddCategory] = useState('OTHER')
  const [adding, setAdding] = useState(false)

  // ── Start editing ──────────────────────────────────────────────────────────
  function startEdit(req: PetRequirement) {
    setEditingId(req.id)
    setEditTitle(req.title)
    setEditCategory(req.category)
  }

  function cancelEdit() {
    setEditingId(null)
    setEditTitle('')
    setEditCategory('OTHER')
  }

  // ── Save edit ──────────────────────────────────────────────────────────────
  async function handleSaveEdit(req: PetRequirement) {
    if (!editTitle.trim() || editTitle.trim().length < 3) {
      toast.error('Título deve ter pelo menos 3 caracteres.')
      return
    }

    const res = await fetch(`/api/pets/${petId}/requirements/${req.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle.trim(), category: editCategory }),
    })

    if (!res.ok) {
      toast.error('Erro ao atualizar requisito.')
      return
    }

    const updated = (await res.json()) as PetRequirement
    setRequirements((prev) => prev.map((r) => (r.id === req.id ? updated : r)))
    cancelEdit()
    router.refresh()
    toast.success('Requisito atualizado!')
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleDelete(reqId: string) {
    setDeletingId(reqId)
    const res = await fetch(`/api/pets/${petId}/requirements/${reqId}`, {
      method: 'DELETE',
    })
    setDeletingId(null)

    if (!res.ok) {
      toast.error('Erro ao remover requisito.')
      return
    }

    setRequirements((prev) => prev.filter((r) => r.id !== reqId))
    router.refresh()
    toast.success('Requisito removido.')
  }

  // ── Add ────────────────────────────────────────────────────────────────────
  async function handleAdd() {
    if (!addTitle.trim() || addTitle.trim().length < 3) {
      toast.error('Título deve ter pelo menos 3 caracteres.')
      return
    }

    setAdding(true)
    const nextOrder =
      requirements.length > 0
        ? Math.max(...requirements.map((r) => r.order)) + 1
        : 1

    const res = await fetch(`/api/pets/${petId}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: addTitle.trim(),
        category: addCategory,
        isMandatory: true,
        order: nextOrder,
      }),
    })
    setAdding(false)

    if (!res.ok) {
      toast.error('Erro ao adicionar requisito.')
      return
    }

    const newReq = (await res.json()) as PetRequirement
    setRequirements((prev) => [...prev, newReq])
    setAddTitle('')
    setAddCategory('OTHER')
    setShowAdd(false)
    router.refresh()
    toast.success('Requisito adicionado!')
  }

  return (
    <div className="flex flex-col gap-3">
      {/* ── Requirement list ─────────────────────────────────────────── */}
      {requirements.length === 0 && !showAdd && (
        <p className="font-nunito text-[14px] text-[#8fa7b2]">
          Nenhum requisito cadastrado.
        </p>
      )}

      {requirements
        .sort((a, b) => a.order - b.order)
        .map((req) =>
          editingId === req.id ? (
            // ── Inline edit row ──
            <div
              key={req.id}
              className="flex flex-col gap-2 rounded-[12px] border border-[#d3e2e5] bg-white p-3"
            >
              <div className="flex gap-2">
                <Select value={editCategory} onValueChange={setEditCategory}>
                  <SelectTrigger
                    className={cn(inputCls, 'h-auto w-[160px] shrink-0')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSaveEdit(req)
                    }
                    if (e.key === 'Escape') cancelEdit()
                  }}
                  autoFocus
                  className={cn(inputCls, 'flex-1')}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="font-nunito text-accent-navy/50 hover:text-accent-navy px-3 py-1 text-[13px] transition-colors focus-visible:outline-none"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(req)}
                  className="font-nunito bg-accent-navy rounded-[8px] px-4 py-1.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                >
                  Salvar
                </button>
              </div>
            </div>
          ) : (
            // ── Display row ──
            <div
              key={req.id}
              className="flex items-center justify-between gap-3 rounded-[12px] border border-[#d3e2e5] bg-white px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-brand-primary-pale text-accent-navy shrink-0 rounded-full border-transparent text-[10px] font-bold tracking-wide uppercase"
                >
                  {CATEGORY_LABELS[req.category] ?? req.category}
                </Badge>
                <span className="font-nunito text-accent-navy truncate text-[14px] font-semibold">
                  {req.title}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(req)}
                  aria-label="Editar requisito"
                  className="text-accent-navy/40 hover:text-accent-navy flex size-8 items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:ring-[#d3e2e5] focus-visible:outline-none"
                >
                  <Pencil className="size-3.5" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(req.id)}
                  disabled={deletingId === req.id}
                  aria-label="Remover requisito"
                  className="text-brand-primary/60 hover:text-brand-primary flex size-8 items-center justify-center rounded-[8px] transition-colors focus-visible:ring-2 focus-visible:ring-[#d3e2e5] focus-visible:outline-none disabled:opacity-40"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </div>
            </div>
          ),
        )}

      {/* ── Add form ────────────────────────────────────────────────── */}
      {showAdd ? (
        <div className="flex flex-col gap-2 rounded-[12px] border border-dashed border-[#d3e2e5] bg-white p-3">
          <div className="flex gap-2">
            <Select value={addCategory} onValueChange={setAddCategory}>
              <SelectTrigger
                className={cn(inputCls, 'h-auto w-[160px] shrink-0')}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input
              type="text"
              value={addTitle}
              onChange={(e) => setAddTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAdd()
                }
                if (e.key === 'Escape') {
                  setShowAdd(false)
                  setAddTitle('')
                  setAddCategory('OTHER')
                }
              }}
              autoFocus
              placeholder="Ex: Ter espaço para o pet correr"
              className={cn(inputCls, 'flex-1')}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowAdd(false)
                setAddTitle('')
                setAddCategory('OTHER')
              }}
              className="font-nunito text-accent-navy/50 hover:text-accent-navy px-3 py-1 text-[13px] transition-colors focus-visible:outline-none"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleAdd()}
              disabled={adding || addTitle.trim().length < 3}
              className="font-nunito bg-accent-navy rounded-[8px] px-4 py-1.5 text-[13px] font-bold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
            >
              {adding ? 'Adicionando…' : 'Adicionar'}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className={cn(
            'font-nunito text-accent-navy/60 hover:text-accent-navy hover:border-accent-navy flex w-full items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#d3e2e5] py-3 text-[14px] font-semibold transition-colors',
            'focus-visible:ring-accent-navy focus-visible:ring-2 focus-visible:outline-none',
          )}
        >
          <Plus className="size-4" aria-hidden />
          Adicionar requisito
        </button>
      )}
    </div>
  )
}
