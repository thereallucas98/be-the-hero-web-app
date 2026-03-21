import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { adoptionInterestRepository } from '~/server/repositories'
import { withdrawAdoptionInterest } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; interestId: string }> },
) {
  const principal = await getPrincipal(req)

  const { id, interestId } = await params

  const petIdParsed = z.uuid().safeParse(id)
  if (!petIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid pet id', details: petIdParsed.error.issues },
      { status: 400 },
    )
  }

  const interestIdParsed = z.uuid().safeParse(interestId)
  if (!interestIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid interest id',
        details: interestIdParsed.error.issues,
      },
      { status: 400 },
    )
  }

  const result = await withdrawAdoptionInterest(
    adoptionInterestRepository,
    principal,
    { interestId: interestIdParsed.data },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Interest not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return new NextResponse(null, { status: 204 })
}
