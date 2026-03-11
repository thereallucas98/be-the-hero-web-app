import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { workspaceRepository } from '~/server/repositories'
import { removeCityCoverage } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; coverageId: string }> },
) {
  const principal = await getPrincipal(req)

  const { id, coverageId } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid workspace id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const coverageIdParsed = z.uuid().safeParse(coverageId)
  if (!coverageIdParsed.success) {
    return NextResponse.json(
      {
        message: 'Invalid coverage id',
        details: coverageIdParsed.error.issues,
      },
      { status: 400 },
    )
  }

  const result = await removeCityCoverage(workspaceRepository, principal, {
    workspaceId: idParsed.data,
    coverageId: coverageIdParsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace or coverage entry not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(
    { message: 'City coverage removed successfully' },
    { status: 200 },
  )
}
