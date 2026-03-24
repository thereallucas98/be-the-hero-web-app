'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ReactNode } from 'react'
import { cn } from '~/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = 'perfil' | 'localizacao' | 'membros'

interface SettingsTabsProps {
  activeTab: string
  children: Record<Tab, ReactNode>
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'perfil', label: 'Perfil' },
  { id: 'localizacao', label: 'Localização' },
  { id: 'membros', label: 'Membros' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsTabs({ activeTab, children }: SettingsTabsProps) {
  const params = useParams<{ id: string }>()
  const base = `/workspaces/${params.id}/settings`
  const current = TABS.some((t) => t.id === activeTab)
    ? (activeTab as Tab)
    : 'perfil'

  return (
    <div className="flex flex-col gap-6">
      {/* ── Tab nav ─────────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-[#d3e2e5]">
        {TABS.map((tab) => {
          const isActive = tab.id === current
          return (
            <Link
              key={tab.id}
              href={`${base}?tab=${tab.id}`}
              className={cn(
                'font-nunito -mb-px border-b-2 px-5 py-3 text-[15px] font-semibold transition-colors focus-visible:outline-none',
                isActive
                  ? 'border-accent-navy text-accent-navy'
                  : 'text-accent-navy/40 hover:text-accent-navy border-transparent hover:border-[#d3e2e5]',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* ── Tab content ─────────────────────────────────────────────── */}
      <div className="rounded-[20px] border border-[#d3e2e5] bg-white p-8">
        {children[current]}
      </div>
    </div>
  )
}
