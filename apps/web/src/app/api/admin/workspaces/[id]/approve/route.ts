import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { workspaceRepository } from '~/server/repositories'
import { approveWorkspace } from '~/server/use-cases'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)
  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid workspace id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await approveWorkspace(
    workspaceRepository,
    principal,
    idParsed.data,
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      WORKSPACE_NOT_REVIEWABLE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Workspace not found',
      WORKSPACE_NOT_REVIEWABLE: 'Workspace is not in PENDING status',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.workspace, { status: 200 })
}
