import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { RejectPetSchema } from '~/server/schemas/pet.schema'
import { rejectPetAdmin } from '~/server/use-cases'

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

  const body = await req.json().catch(() => null)
  const parsed = RejectPetSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await rejectPetAdmin(petRepository, principal, {
    petId: petIdParsed.data,
    reviewNote: parsed.data.reviewNote,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      INVALID_STATUS: 409,
      WORKSPACE_BLOCKED: 403,
      MISSING_REVIEW_NOTE: 400,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Pet not found',
      FORBIDDEN: 'Forbidden',
      INVALID_STATUS: 'Pet must be pending review',
      WORKSPACE_BLOCKED: 'Workspace is inactive or rejected',
      MISSING_REVIEW_NOTE: 'Review note is required',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.pet, { status: 200 })
}
