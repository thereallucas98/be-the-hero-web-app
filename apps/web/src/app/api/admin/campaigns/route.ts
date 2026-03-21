import { NextResponse } from 'next/server'
import { getPrincipal } from '~/lib/get-principal'
import { campaignRepository } from '~/server/repositories'
import { ListCampaignsQuerySchema } from '~/server/schemas/campaign.schema'
import { listAdminCampaigns } from '~/server/use-cases'

export async function GET(req: Request) {
  const principal = await getPrincipal(req)
  const { searchParams } = new URL(req.url)

  const parsed = ListCampaignsQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    workspaceId: searchParams.get('workspaceId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listAdminCampaigns(
    campaignRepository,
    principal,
    parsed.data,
  )

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

  return NextResponse.json(result.data, { status: 200 })
}
