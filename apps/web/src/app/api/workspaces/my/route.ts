import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { workspaceRepository } from '~/server/repositories'
import { listMyWorkspaces } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)
  const result = await listMyWorkspaces(workspaceRepository, principal)

  if (!result.success) {
    return NextResponse.json({ message: 'Unauthenticated' }, { status: 401 })
  }

  return NextResponse.json({ memberships: result.memberships }, { status: 200 })
}
