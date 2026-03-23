interface PetDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function PetDetailPage({ params }: PetDetailPageProps) {
  const { id } = await params
  return (
    <main className="px-5 py-16">
      <p className="text-foreground-subtle text-center text-lg">
        Em breve — Animal {id}
      </p>
    </main>
  )
}
