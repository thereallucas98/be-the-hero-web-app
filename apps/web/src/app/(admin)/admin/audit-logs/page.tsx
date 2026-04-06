'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/lib/api-client'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const ENTITY_TYPES = [
  { value: '_all', label: 'Todos' },
  { value: 'PET', label: 'Pet' },
  { value: 'WORKSPACE', label: 'Workspace' },
  { value: 'CAMPAIGN', label: 'Campanha' },
  { value: 'DONATION', label: 'Doação' },
  { value: 'ADOPTION', label: 'Adoção' },
  { value: 'ADOPTION_INTEREST', label: 'Interesse' },
  { value: 'FOLLOW_UP', label: 'Acompanhamento' },
  { value: 'USER', label: 'Usuário' },
]

const ACTIONS = [
  { value: '_all', label: 'Todas' },
  { value: 'CREATE', label: 'Criar' },
  { value: 'UPDATE', label: 'Atualizar' },
  { value: 'DELETE', label: 'Excluir' },
  { value: 'APPROVE', label: 'Aprovar' },
  { value: 'REJECT', label: 'Rejeitar' },
]

interface AuditLogItem {
  id: string
  actorUserId: string
  action: string
  entityType: string
  entityId: string
  metadata: Record<string, unknown> | null
  createdAt: string
}

interface AuditLogsResponse {
  data: AuditLogItem[]
  total: number
  page: number
  perPage: number
}

export default function AdminAuditLogsPage() {
  const [entityType, setEntityType] = useState('_all')
  const [action, setAction] = useState('_all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const perPage = 20

  const effectiveEntityType = entityType === '_all' ? '' : entityType
  const effectiveAction = action === '_all' ? '' : action

  const queryKey = [
    'auditLogs',
    effectiveEntityType,
    effectiveAction,
    dateFrom,
    dateTo,
    page,
  ]

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        perPage: String(perPage),
      })
      if (effectiveEntityType) params.set('entityType', effectiveEntityType)
      if (effectiveAction) params.set('action', effectiveAction)
      if (dateFrom) params.set('dateFrom', dateFrom)
      if (dateTo) params.set('dateTo', dateTo)

      return api.get<AuditLogsResponse>(`/api/admin/audit-logs?${params}`)
    },
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-5xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Logs de Auditoria
      </h1>

      {/* Filters */}
      <div className="border-border bg-card mb-6 rounded-xl border p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label>Entidade</Label>
            <Select
              value={entityType}
              onValueChange={(v) => {
                setEntityType(v)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ENTITY_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Ação</Label>
            <Select
              value={action}
              onValueChange={(v) => {
                setAction(v)
                setPage(1)
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>
                    {a.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>De</Label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value)
                setPage(1)
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Até</Label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value)
                setPage(1)
              }}
            />
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setEntityType('_all')
              setAction('_all')
              setDateFrom('')
              setDateTo('')
              setPage(1)
            }}
          >
            Limpar filtros
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <FileText className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhum log encontrado.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Data
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Ator
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Ação
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Entidade
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    ID
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((log) => (
                  <tr
                    key={log.id}
                    className="border-border hover:bg-muted/50 border-b transition-colors"
                  >
                    <td className="text-muted-foreground px-3 py-2 text-xs">
                      {new Date(log.createdAt).toLocaleString('pt-BR')}
                    </td>
                    <td className="text-foreground px-3 py-2 text-xs">
                      {log.actorUserId.slice(0, 8)}…
                    </td>
                    <td className="px-3 py-2 text-xs font-medium">
                      {log.action}
                    </td>
                    <td className="text-muted-foreground px-3 py-2 text-xs">
                      {log.entityType}
                    </td>
                    <td className="text-muted-foreground px-3 py-2 font-mono text-xs">
                      {log.entityId.slice(0, 8)}…
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="flex flex-col gap-2 sm:hidden">
            {items.map((log) => (
              <div
                key={log.id}
                className="border-border bg-card rounded-lg border p-3 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-foreground text-xs font-medium">
                    {log.action}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {log.entityType}
                  </span>
                </div>
                <p className="text-foreground mt-1 text-sm">
                  {log.actorUserId.slice(0, 8)}…
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-muted-foreground font-mono text-xs">
                    {log.entityId.slice(0, 8)}…
                  </span>
                  <time className="text-muted-foreground text-xs">
                    {new Date(log.createdAt).toLocaleString('pt-BR')}
                  </time>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-muted-foreground text-sm">
                {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
