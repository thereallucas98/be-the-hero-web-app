import { NextResponse } from 'next/server'
import { z } from 'zod'
import { geoPlaceRepository } from '~/server/repositories'
import { listCities } from '~/server/use-cases'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const stateId = searchParams.get('stateId') ?? undefined

  if (stateId !== undefined) {
    const parsed = z.uuid().safeParse(stateId)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid stateId', details: parsed.error.issues },
        { status: 400 },
      )
    }
  }

  const result = await listCities(geoPlaceRepository, { stateId })
  return NextResponse.json(result.cities, { status: 200 })
}
