'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { useMyInterests } from '~/graphql/hooks/use-my-interests'
import { useWithdrawInterest } from '~/graphql/hooks/use-withdraw-interest'
import { InterestCard } from '~/components/features/guardian/interest-card'
import { Button } from '~/components/ui/button'

export default function GuardianInterestsPage() {
  const [page, setPage] = useState(1)
  const perPage = 10

  const { data, isLoading } = useMyInterests({ page, perPage })
  const withdrawMutation = useWithdrawInterest()

  const items = data?.items ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / perPage)

  return (
    <div className="mx-auto w-full max-w-3xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">
        Meus Interesses
      </h1>

      {isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Heart className="text-muted-foreground size-10" aria-hidden />
          <p className="text-muted-foreground text-sm">
            Você ainda não demonstrou interesse em nenhum pet.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {items.map((interest) => (
              <InterestCard
                key={interest.id}
                interest={interest}
                onWithdraw={(id) => withdrawMutation.mutate(id)}
                isWithdrawing={withdrawMutation.isPending}
              />
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
