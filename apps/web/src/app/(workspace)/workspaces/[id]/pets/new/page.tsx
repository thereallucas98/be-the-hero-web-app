import { WorkspaceHeaderBanner } from '~/components/features/workspaces/workspace-header-banner'
import { AddPetForm } from '~/components/features/pets/add-pet-form'

// TODO: replace static props with real workspace data fetched by `id`
export default function AddPetPage() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <WorkspaceHeaderBanner
        name="Seu Cãopanheiro"
        address="Rua do meio, 123, Boa viagem, Recife - PE"
        settingsHref="#"
      />
      <AddPetForm />
    </div>
  )
}
