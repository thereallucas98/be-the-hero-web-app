import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { UpdatePetImageSchema } from '~/server/schemas/pet-image.schema'
import { removePetImage, updatePetImage } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ petId: string; imageId: string }> },
) {
  const principal = await getPrincipal(req)

  const { petId, imageId } = await params

  const petIdParsed = z.uuid().safeParse(petId)
  if (!petIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: petIdParsed.error.issues },
      { status: 400 },
    )
  }

  const imageIdParsed = z.uuid().safeParse(imageId)
  if (!imageIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid image id', details: imageIdParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await removePetImage(petRepository, principal, {
    petId: petIdParsed.data,
    imageId: imageIdParsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      CANNOT_REMOVE_LAST_IMAGE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet or image not found',
      FORBIDDEN: 'Forbidden',
      CANNOT_REMOVE_LAST_IMAGE:
        'Cannot remove last image when pet is pending review',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return new NextResponse(null, { status: 204 })
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ petId: string; imageId: string }> },
) {
  const principal = await getPrincipal(req)

  const { petId, imageId } = await params

  const petIdParsed = z.uuid().safeParse(petId)
  if (!petIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: petIdParsed.error.issues },
      { status: 400 },
    )
  }

  const imageIdParsed = z.uuid().safeParse(imageId)
  if (!imageIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid image id', details: imageIdParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdatePetImageSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await updatePetImage(petRepository, principal, {
    petId: petIdParsed.data,
    imageId: imageIdParsed.data,
    data: parsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      POSITION_ALREADY_TAKEN: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet or image not found',
      FORBIDDEN: 'Forbidden',
      POSITION_ALREADY_TAKEN: 'Position already in use',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.image, { status: 200 })
}
