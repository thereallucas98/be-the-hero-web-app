import { NextResponse } from 'next/server'
import { z } from 'zod'
import { petRepository } from '~/server/repositories'
import { TrackPetEventSchema } from '~/server/schemas/pet.schema'
import { trackPetEvent } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = TrackPetEventSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await trackPetEvent(petRepository, {
    petId: idParsed.data,
    type: parsed.data.type,
  })

  if (!result.success) {
    return NextResponse.json({ message: 'Pet not found' }, { status: 404 })
  }

  return new NextResponse(null, { status: 204 })
}
