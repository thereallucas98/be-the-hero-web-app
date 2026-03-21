import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import {
  campaignRepository,
  petRepository,
  workspaceRepository,
} from '~/server/repositories'
import {
  CreateCampaignSchema,
  ListCampaignsQuerySchema,
} from '~/server/schemas/campaign.schema'
import { createCampaign, listWorkspaceCampaigns } from '~/server/use-cases'

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
  const parsed = CreateCampaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await createCampaign(
    campaignRepository,
    workspaceRepository,
    petRepository,
    principal,
    { workspaceId: idParsed.data, ...parsed.data },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      WORKSPACE_NOT_FOUND: 404,
      WORKSPACE_BLOCKED: 409,
      PET_NOT_FOUND: 404,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      WORKSPACE_NOT_FOUND: 'Workspace not found',
      WORKSPACE_BLOCKED: 'Workspace is inactive or not approved',
      PET_NOT_FOUND: 'Pet not found',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.campaign, { status: 201 })
}

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

  const { searchParams } = new URL(req.url)
  const query = ListCampaignsQuerySchema.safeParse(
    Object.fromEntries(searchParams.entries()),
  )
  if (!query.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: query.error.issues },
      { status: 400 },
    )
  }

  const result = await listWorkspaceCampaigns(campaignRepository, principal, {
    workspaceId: idParsed.data,
    status: query.data.status,
    page: query.data.page,
    perPage: query.data.perPage,
  })

  if (!result.success) {
    const statusMap = { UNAUTHENTICATED: 401, FORBIDDEN: 403 } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.result, { status: 200 })
}
