'use client'

import { useMe } from '~/graphql/hooks/use-me'
import { ProfileForm } from '~/components/features/guardian/profile-form'
import { ChangePasswordForm } from '~/components/features/guardian/change-password-form'
import { Separator } from '~/components/ui/separator'

export default function GuardianProfilePage() {
  const { data: user, isLoading } = useMe()

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <div className="bg-muted h-8 w-32 animate-pulse rounded" />
        <div className="bg-muted mt-6 h-48 animate-pulse rounded-xl" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-2xl p-6 lg:p-8">
        <p className="text-muted-foreground text-sm">
          Não foi possível carregar o perfil.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl p-6 lg:p-8">
      <h1 className="text-foreground mb-6 text-2xl font-bold">Meu Perfil</h1>

      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Informações pessoais
        </h2>
        <ProfileForm
          defaultValues={{
            fullName: user.fullName ?? '',
          }}
        />
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">
          Alterar senha
        </h2>
        <ChangePasswordForm />
      </section>
    </div>
  )
}
