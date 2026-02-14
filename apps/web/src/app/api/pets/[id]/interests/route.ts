import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  adoptionInterestRepository,
  petRepository,
} from '~/server/repositories'
import { RegisterAdoptionInterestSchema } from '~/server/schemas/pet.schema'
import { registerAdoptionInterest } from '~/server/use-cases'

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

  const body = await req.json().catch(() => ({}))
  const parsed = RegisterAdoptionInterestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await registerAdoptionInterest(
    petRepository,
    adoptionInterestRepository,
    principal,
    {
      petId: petIdParsed.data,
      message: parsed.data.message,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      PET_NOT_APPROVED: 409,
      PET_INACTIVE: 409,
      WORKSPACE_BLOCKED: 403,
      PET_ALREADY_ADOPTED: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Only GUARDIAN can register adoption interest',
      NOT_FOUND: 'Pet not found',
      PET_NOT_APPROVED: 'Pet must be approved',
      PET_INACTIVE: 'Pet is not active',
      WORKSPACE_BLOCKED: 'Workspace is inactive or not approved',
      PET_ALREADY_ADOPTED: 'Pet has already been adopted',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.interest, { status: 201 })
}
