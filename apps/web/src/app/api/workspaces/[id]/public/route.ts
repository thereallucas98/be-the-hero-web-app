import { NextResponse } from 'next/server'
import { z } from 'zod'
import { workspaceRepository } from '~/server/repositories'
import { getPublicWorkspace } from '~/server/use-cases'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid workspace id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await getPublicWorkspace(workspaceRepository, idParsed.data)

  if (!result.success) {
    return NextResponse.json(
      { message: 'Workspace not found' },
      { status: 404 },
    )
  }

  return NextResponse.json(result.workspace, { status: 200 })
}
