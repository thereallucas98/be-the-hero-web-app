import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { submitPetForReview } from '~/server/use-cases'

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

  const result = await submitPetForReview(petRepository, principal, {
    petId: idParsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      INVALID_STATUS: 400,
      INVALID_DATA: 400,
      INVALID_IMAGES: 400,
      WORKSPACE_BLOCKED: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet not found',
      FORBIDDEN: 'Forbidden',
      INVALID_STATUS: 'Pet must be in DRAFT status',
      INVALID_DATA:
        'Pet must have minimum data (name, description, species, sex, size, age)',
      INVALID_IMAGES:
        'Pet must have 1-5 images with exactly one cover and valid positions',
      WORKSPACE_BLOCKED: 'Workspace is inactive or verification is blocked',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.pet, { status: 200 })
}
