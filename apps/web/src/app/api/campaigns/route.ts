import { NextResponse } from 'next/server'
import { campaignRepository } from '~/server/repositories'
import { ListPublicCampaignsQuerySchema } from '~/server/schemas/campaign.schema'
import { listPublicCampaigns } from '~/server/use-cases'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const parsed = ListPublicCampaignsQuerySchema.safeParse({
    cityId: searchParams.get('cityId') ?? undefined,
    workspaceId: searchParams.get('workspaceId') ?? undefined,
    petId: searchParams.get('petId') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listPublicCampaigns(campaignRepository, parsed.data)
  return NextResponse.json(result.data, { status: 200 })
}
