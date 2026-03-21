import { NextResponse } from 'next/server'
import { z } from 'zod'
import { geoPlaceRepository } from '~/server/repositories'
import { listStates } from '~/server/use-cases'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const countryId = searchParams.get('countryId') ?? undefined

  if (countryId !== undefined) {
    const parsed = z.uuid().safeParse(countryId)
    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid countryId', details: parsed.error.issues },
        { status: 400 },
      )
    }
  }

  const result = await listStates(geoPlaceRepository, { countryId })
  return NextResponse.json(result.states, { status: 200 })
}
