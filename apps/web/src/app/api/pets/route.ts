import { NextResponse } from 'next/server'
import { petRepository } from '~/server/repositories'
import { ListPetsQuerySchema } from '~/server/schemas/pet.schema'
import { listPets } from '~/server/use-cases'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const query = Object.fromEntries(searchParams.entries())

  const parsed = ListPetsQuerySchema.safeParse(query)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listPets(petRepository, {
    cityPlaceId: parsed.data.cityPlaceId,
    workspaceId: parsed.data.workspaceId,
    species: parsed.data.species,
    sex: parsed.data.sex,
    size: parsed.data.size,
    ageCategory: parsed.data.ageCategory,
    energyLevel: parsed.data.energyLevel,
    independenceLevel: parsed.data.independenceLevel,
    hasRequirements: parsed.data.hasRequirements,
    page: parsed.data.page,
    perPage: parsed.data.perPage,
  })

  return NextResponse.json(result, { status: 200 })
}
