'use client'

import { useCallback, useEffect, useState } from 'react'
import { MapPin, Plus, Trash2 } from 'lucide-react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

interface MeUser {
  id: string
  role: string
}

interface CoverageItem {
  id: string
  adminUserId: string
  cityPlaceId: string
  cityPlace: { id: string; name: string; slug: string; type: string }
}

interface GeoStateItem {
  id: string
  name: string
  slug: string
}

interface GeoCityItem {
  id: string
  name: string
  slug: string
}

export default function AdminCoveragePage() {
  const queryClient = useQueryClient()
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)
  const [selectedStateId, setSelectedStateId] = useState('')
  const [selectedCityId, setSelectedCityId] = useState('')
  const [cities, setCities] = useState<GeoCityItem[]>([])

  const { data: me } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await fetch('/api/me', { credentials: 'include' })
      if (!res.ok) throw new Error('Erro ao carregar usuário')
      const data = await res.json()
      return data.user as MeUser
    },
  })

  const isAdmin = me?.role === 'ADMIN'

  const { data: coverage, isLoading } = useQuery({
    queryKey: ['adminCoverage'],
    queryFn: async () => {
      const res = await fetch('/api/admin/coverage', {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Erro ao carregar cobertura')
      return res.json() as Promise<CoverageItem[]>
    },
    enabled: !!me,
  })

  const { data: states } = useQuery({
    queryKey: ['geoStates'],
    queryFn: async () => {
      const res = await fetch('/api/geo/states')
      if (!res.ok) throw new Error('Erro ao carregar estados')
      return res.json() as Promise<GeoStateItem[]>
    },
  })

  const fetchCities = useCallback(async (stateId: string) => {
    const res = await fetch(`/api/geo/cities?stateId=${stateId}`)
    if (!res.ok) return
    const data: GeoCityItem[] = await res.json()
    setCities(data)
  }, [])

  useEffect(() => {
    if (selectedStateId) {
      setSelectedCityId('')
      setCities([])
      fetchCities(selectedStateId)
    }
  }, [selectedStateId, fetchCities])

  const addMutation = useMutation({
    mutationFn: async (cityId: string) => {
      if (!me?.id) throw new Error('Usuário não carregado')
      const res = await fetch('/api/admin/coverage', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUserId: me.id, cityId }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao adicionar cobertura')
      }
    },
    onSuccess: () => {
      toast.success('Cobertura adicionada')
      setSelectedCityId('')
      queryClient.invalidateQueries({ queryKey: ['adminCoverage'] })
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coverage/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.message ?? 'Erro ao remover cobertura')
      }
    },
    onSuccess: () => {
      setRemoveTarget(null)
      toast.success('Cobertura removida')
      queryClient.invalidateQueries({ queryKey: ['adminCoverage'] })
    },
  })

  const items = coverage ?? []

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Cobertura de Cidades
      </h1>

      {/* Add form — ADMIN only (SUPER_ADMIN manages via API) */}
      {isAdmin && (
        <div className="border-border bg-card mb-8 rounded-xl border p-4 shadow-sm">
          <h2 className="text-foreground mb-3 text-sm font-semibold">
            Adicionar cidade
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="flex flex-col gap-1.5">
              <Label>Estado</Label>
              <Select
                value={selectedStateId}
                onValueChange={setSelectedStateId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estado" />
                </SelectTrigger>
                <SelectContent>
                  {(states ?? []).map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>Cidade</Label>
              <Select
                value={selectedCityId}
                onValueChange={setSelectedCityId}
                disabled={!selectedStateId || cities.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a cidade" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              disabled={!selectedCityId || addMutation.isPending}
              onClick={() => addMutation.mutate(selectedCityId)}
            >
              <Plus className="size-4" aria-hidden />
              Adicionar
            </Button>
          </div>
        </div>
      )}

      {/* Coverage list */}
      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-14 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Nenhuma cidade coberta.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="border-border bg-card flex items-center justify-between rounded-xl border p-3 shadow-sm"
            >
              <div className="flex items-center gap-2">
                <MapPin className="text-muted-foreground size-4" aria-hidden />
                <span className="text-foreground text-sm font-medium">
                  {item.cityPlace.name}
                </span>
              </div>
              {isAdmin && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 size-8 cursor-pointer"
                  aria-label={`Remover ${item.cityPlace.name}`}
                  onClick={() => setRemoveTarget(item.id)}
                >
                  <Trash2 className="size-4" aria-hidden />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover cobertura?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa cidade será removida da sua cobertura administrativa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removeTarget && removeMutation.mutate(removeTarget)
              }
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
