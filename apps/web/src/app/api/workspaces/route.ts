import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { geoPlaceRepository, workspaceRepository } from '~/server/repositories'
import { createWorkspace } from '~/server/use-cases'
import { CreateWorkspaceSchema } from '~/server/schemas/workspace.schema'

export async function POST(req: Request) {
  const principal = await getPrincipal(req)

  const body = await req.json().catch(() => null)
  const parsed = CreateWorkspaceSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await createWorkspace(
    workspaceRepository,
    geoPlaceRepository,
    principal,
    parsed.data,
  )

  if (!result.success) {
    if (result.code === 'UNAUTHENTICATED') {
      return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
    }
    if (result.code === 'FORBIDDEN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { message: 'Invalid cityPlaceId' },
      { status: 400 },
    )
  }

  return NextResponse.json({ workspace: result.workspace }, { status: 201 })
}
