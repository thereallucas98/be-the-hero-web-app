import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  adoptionInterestRepository,
  workspaceRepository,
} from '~/server/repositories'
import { dismissAdoptionInterest } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; interestId: string }> },
) {
  const principal = await getPrincipal(req)
  const { id, interestId } = await params

  const workspaceIdParsed = z.uuid().safeParse(id)
  if (!workspaceIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid workspace id',
        details: workspaceIdParsed.error.issues,
      },
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

  const result = await dismissAdoptionInterest(
    adoptionInterestRepository,
    workspaceRepository,
    principal,
    {
      workspaceId: workspaceIdParsed.data,
      interestId: interestIdParsed.data,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Interest not found',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return new NextResponse(null, { status: 204 })
}
