import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { campaignRepository } from '~/server/repositories'
import { UpdateCampaignSchema } from '~/server/schemas/campaign.schema'
import { getCampaignById, updateCampaign } from '~/server/use-cases'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const principal = await getPrincipal(req)
  const { id } = await params

  const idParsed = z.uuid().safeParse(id)
  if (!idParsed.success) {
    return NextResponse.json(
      { message: 'Invalid campaign id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const result = await getCampaignById(
    campaignRepository,
    principal,
    idParsed.data,
  )

  if (!result.success) {
    const statusMap = { NOT_FOUND: 404, FORBIDDEN: 403 } as const
    const messageMap = {
      NOT_FOUND: 'Campaign not found',
      FORBIDDEN: 'Forbidden',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.campaign, { status: 200 })
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
      { message: 'Invalid campaign id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const body = await req.json().catch(() => null)
  const parsed = UpdateCampaignSchema.safeParse(body ?? {})
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await updateCampaign(campaignRepository, principal, {
    campaignId: idParsed.data,
    data: parsed.data,
  })

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      CAMPAIGN_NOT_EDITABLE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Campaign not found',
      CAMPAIGN_NOT_EDITABLE: 'Campaign cannot be edited in its current status',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.campaign, { status: 200 })
}
