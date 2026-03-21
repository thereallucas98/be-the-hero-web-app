import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { adoptionRepository, followUpRepository } from '~/server/repositories'
import { listAdoptionFollowUps } from '~/server/use-cases'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)

  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid adoption id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listAdoptionFollowUps(
    adoptionRepository,
    followUpRepository,
    principal,
    { adoptionId: idParsed.data },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Adoption not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.followUps, { status: 200 })
}
