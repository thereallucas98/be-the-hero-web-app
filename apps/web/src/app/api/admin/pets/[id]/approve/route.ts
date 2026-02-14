import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { approvePetAdmin } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id: petId } = await params

  const petIdParsed = z.uuid().safeParse(petId)
  if (!petIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: petIdParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await approvePetAdmin(petRepository, principal, {
    petId: petIdParsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      INVALID_STATUS: 409,
      INVALID_IMAGES: 400,
      WORKSPACE_BLOCKED: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet not found',
      FORBIDDEN: 'Forbidden',
      INVALID_STATUS: 'Pet must be pending review',
      INVALID_IMAGES: 'Pet must have 1-5 images with exactly one cover',
      WORKSPACE_BLOCKED: 'Workspace is inactive or rejected',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.pet, { status: 200 })
}
