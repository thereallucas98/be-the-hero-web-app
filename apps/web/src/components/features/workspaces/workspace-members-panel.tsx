'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { toast } from 'sonner'
import { z } from 'zod'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  id: string
  role: string
  user: { id: string; fullName: string }
}

export interface WorkspaceMembersPanelProps {
  workspaceId: string
  members: Member[]
  currentUserId: string
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.email('Email inválido'),
  role: z.enum(['OWNER', 'EDITOR', 'FINANCIAL']),
})

type InviteValues = z.infer<typeof inviteSchema>

// ─── Shared classes ───────────────────────────────────────────────────────────

const inputCls = cn(
  'font-nunito text-accent-navy w-full rounded-[10px] border border-[#d3e2e5] bg-[#f5f8fa] px-4 py-3 text-[16px] font-semibold',
  'placeholder:text-[#8fa7b2] placeholder:font-normal',
  'focus-visible:border-accent-navy focus-visible:ring-accent-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
  'disabled:opacity-50',
)

const ROLE_LABELS: Record<string, string> = {
  OWNER: 'Dono',
  EDITOR: 'Editor',
  FINANCIAL: 'Financeiro',
}

// ─── Role badge ───────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: string }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'font-nunito rounded-full border-transparent text-[11px] font-bold tracking-wide uppercase',
        role === 'OWNER' && 'bg-accent-navy/10 text-accent-navy',
        role === 'EDITOR' && 'bg-success-light text-success',
        role === 'FINANCIAL' && 'bg-warning-light text-accent-navy',
      )}
    >
      {ROLE_LABELS[role] ?? role}
    </Badge>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WorkspaceMembersPanel({
  workspaceId,
  members: initialMembers,
  currentUserId,
}: WorkspaceMembersPanelProps) {
  const router = useRouter()
  const [members, setMembers] = useState(initialMembers)
  const [removingId, setRemovingId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<InviteValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: '', role: 'EDITOR' },
  })

  // ── Invite ──
  async function onInvite(values: InviteValues) {
    const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      const msg =
        body?.message === 'User is already a member'
          ? 'Este usuário já é membro'
          : body?.message === 'User not found'
            ? 'Nenhum usuário com esse email'
            : 'Erro ao convidar. Tente novamente.'
      toast.error(msg)
      return
    }

    const newMember = (await res.json()) as Member
    setMembers((prev) => [...prev, newMember])
    reset()
    toast.success('Membro adicionado!')
  }

  // ── Change role ──
  async function onRoleChange(memberId: string, role: string) {
    const res = await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      },
    )

    if (!res.ok) {
      toast.error('Erro ao atualizar papel.')
      return
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role } : m)),
    )
    toast.success('Papel atualizado!')
  }

  // ── Remove ──
  async function onRemove(memberId: string) {
    setRemovingId(memberId)

    const res = await fetch(
      `/api/workspaces/${workspaceId}/members/${memberId}`,
      {
        method: 'DELETE',
      },
    )

    setRemovingId(null)

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        message?: string
      } | null
      toast.error(body?.message ?? 'Erro ao remover membro.')
      return
    }

    setMembers((prev) => prev.filter((m) => m.id !== memberId))
    router.refresh()
    toast.success('Membro removido.')
  }

  return (
    <div className="flex flex-col gap-8">
      {/* ── Member list ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3">
        {members.map((member) => {
          const isSelf = member.user.id === currentUserId
          return (
            <div
              key={member.id}
              className="flex items-center justify-between rounded-[12px] border border-[#d3e2e5] bg-white px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-nunito text-accent-navy text-[15px] font-semibold">
                  {member.user.fullName}
                  {isSelf && (
                    <span className="text-accent-navy/40 ml-1.5 text-[12px] font-normal">
                      (você)
                    </span>
                  )}
                </span>
                <RoleBadge role={member.role} />
              </div>

              <div className="flex items-center gap-3">
                {!isSelf && (
                  <Select
                    value={member.role}
                    onValueChange={(v) => onRoleChange(member.id, v)}
                  >
                    <SelectTrigger
                      aria-label="Alterar papel"
                      className={cn(
                        inputCls,
                        'h-auto w-auto cursor-pointer py-1.5 text-[13px]',
                      )}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">Dono</SelectItem>
                      <SelectItem value="EDITOR">Editor</SelectItem>
                      <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>
                )}

                {!isSelf && (
                  <button
                    type="button"
                    onClick={() => onRemove(member.id)}
                    disabled={removingId === member.id}
                    aria-label={`Remover ${member.user.fullName}`}
                    className="text-brand-primary focus-visible:ring-brand-primary focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Invite form ─────────────────────────────────────────────── */}
      <div>
        <h3 className="font-nunito text-accent-navy mb-4 text-[18px] font-extrabold">
          Convidar membro
        </h3>
        <form
          onSubmit={handleSubmit(onInvite)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex gap-3">
            <div className="flex flex-1 flex-col gap-1">
              <input
                {...register('email')}
                type="email"
                placeholder="email@exemplo.com"
                className={cn(inputCls, errors.email && 'border-brand-primary')}
              />
              {errors.email && (
                <p className="font-nunito text-brand-primary text-[13px] font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    aria-label="Papel do novo membro"
                    className={cn(inputCls, 'h-auto w-auto cursor-pointer')}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="OWNER">Dono</SelectItem>
                    <SelectItem value="FINANCIAL">Financeiro</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="font-nunito bg-accent-navy flex h-[48px] cursor-pointer items-center justify-center rounded-[14px] px-8 text-[16px] font-extrabold text-white transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none disabled:opacity-50"
            >
              {isSubmitting ? 'Convidando…' : 'Convidar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
