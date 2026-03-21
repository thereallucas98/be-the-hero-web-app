import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { petRepository } from '~/server/repositories'
import { UpdatePetRequirementSchema } from '~/server/schemas/pet.schema'
import { removePetRequirement, updatePetRequirement } from '~/server/use-cases'

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; reqId: string }> },
) {
  const principal = await getPrincipal(req)

  const { id, reqId } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const reqIdParsed = z.uuid().safeParse(reqId)
  if (!reqIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid requirement id', details: reqIdParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdatePetRequirementSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await updatePetRequirement(petRepository, principal, {
    petId: idParsed.data,
    reqId: reqIdParsed.data,
    ...parsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      ORDER_CONFLICT: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Not found',
      FORBIDDEN: 'Forbidden',
      ORDER_CONFLICT: 'Order already taken for this pet',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.requirement, { status: 200 })
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; reqId: string }> },
) {
  const principal = await getPrincipal(req)

  const { id, reqId } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const reqIdParsed = z.uuid().safeParse(reqId)
  if (!reqIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid requirement id', details: reqIdParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await removePetRequirement(petRepository, principal, {
    petId: idParsed.data,
    reqId: reqIdParsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return new NextResponse(null, { status: 204 })
}
