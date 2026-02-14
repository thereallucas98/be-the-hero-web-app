import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { auditRepository, workspaceRepository } from '~/server/repositories'
import { UpdateWorkspaceSchema } from '~/server/schemas/workspace.schema'
import { getWorkspaceById, updateWorkspace } from '~/server/use-cases'

const MEMBERS_PER_PAGE = 20

export async function GET(
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

  const url = new URL(req.url)
  const membersPage = Math.max(
    1,
    parseInt(url.searchParams.get('membersPage') ?? '1', 10),
  )
  const membersPerPage = Math.min(
    100,
    Math.max(
      1,
      parseInt(
        url.searchParams.get('membersPerPage') ?? String(MEMBERS_PER_PAGE),
        10,
      ),
    ),
  )

  const result = await getWorkspaceById(workspaceRepository, principal, {
    id: idParsed.data,
    membersPage,
    membersPerPage,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.workspace, { status: 200 })
}

export async function PATCH(
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

  const body = await req.json().catch(() => null)
  const parsed = UpdateWorkspaceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await updateWorkspace(
    workspaceRepository,
    auditRepository,
    principal,
    { id: idParsed.data, data: parsed.data },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.workspace, { status: 200 })
}
