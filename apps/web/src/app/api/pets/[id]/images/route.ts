import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { AddPetImageSchema } from '~/server/schemas/pet-image.schema'
import { addPetImage } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = AddPetImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await addPetImage(petRepository, principal, {
    petId: idParsed.data,
    ...parsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      INVALID_STORAGE_PATH: 400,
      MAX_IMAGES_REACHED: 400,
      POSITION_ALREADY_TAKEN: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet not found',
      FORBIDDEN: 'Forbidden',
      INVALID_STORAGE_PATH: 'storagePath must follow pattern pets/{petId}/...',
      MAX_IMAGES_REACHED: 'Pet already has maximum of 5 images',
      POSITION_ALREADY_TAKEN: 'Position already in use',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.image, { status: 201 })
}
