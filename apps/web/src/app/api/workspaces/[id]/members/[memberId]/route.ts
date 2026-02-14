import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { auditRepository, workspaceRepository } from '~/server/repositories'
import { removeWorkspaceMember } from '~/server/use-cases'

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; memberId: string }> },
) {
  const principal = await getPrincipal(req)

  const { id, memberId } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid workspace id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const memberIdParsed = z.uuid().safeParse(memberId)
  if (!memberIdParsed.success) {
    return NextResponse.json(
      { message: 'Invalid member id', details: memberIdParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await removeWorkspaceMember(
    workspaceRepository,
    auditRepository,
    principal,
    {
      workspaceId: idParsed.data,
      memberId: memberIdParsed.data,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      CANNOT_REMOVE_LAST_OWNER: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace or member not found',
      FORBIDDEN: 'Forbidden',
      CANNOT_REMOVE_LAST_OWNER:
        'Cannot remove the only OWNER from the workspace',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(
    { message: 'Member removed successfully' },
    { status: 200 },
  )
}
