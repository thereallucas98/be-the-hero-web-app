import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  auditRepository,
  userRepository,
  workspaceRepository,
} from '~/server/repositories'
import { AddWorkspaceMemberSchema } from '~/server/schemas/workspace.schema'
import { addWorkspaceMember } from '~/server/use-cases'

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

  const body = await req.json().catch(() => null)
  const parsed = AddWorkspaceMemberSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await addWorkspaceMember(
    workspaceRepository,
    userRepository,
    auditRepository,
    principal,
    {
      workspaceId: idParsed.data,
      email: parsed.data.email,
      role: parsed.data.role,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      FORBIDDEN: 403,
      USER_NOT_FOUND: 404,
      ALREADY_MEMBER: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Workspace not found',
      FORBIDDEN: 'Forbidden',
      USER_NOT_FOUND: 'User not found',
      ALREADY_MEMBER: 'User is already a member',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.member, { status: 201 })
}
