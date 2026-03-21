import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getPrincipal } from '~/lib/get-principal'
import { campaignRepository, donationRepository } from '~/server/repositories'
import {
  ListDonationsQuerySchema,
  RegisterDonationSchema,
} from '~/server/schemas/donation.schema'
import { listCampaignDonations, registerDonation } from '~/server/use-cases'

export async function POST(
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
  const parsed = RegisterDonationSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid payload', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await registerDonation(
    campaignRepository,
    donationRepository,
    principal,
    {
      campaignId: idParsed.data,
      ...parsed.data,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      NOT_FOUND: 404,
      CAMPAIGN_NOT_ACTIVE: 409,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      NOT_FOUND: 'Campaign not found',
      CAMPAIGN_NOT_ACTIVE: 'Campaign is not open for donations',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.donation, { status: 201 })
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
      { message: 'Invalid campaign id', details: idParsed.error.issues },
      { status: 400 },
    )
  }

  const { searchParams } = new URL(req.url)
  const parsed = ListDonationsQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    page: searchParams.get('page') ?? undefined,
    perPage: searchParams.get('perPage') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { message: 'Invalid query', details: parsed.error.issues },
      { status: 400 },
    )
  }

  const result = await listCampaignDonations(
    campaignRepository,
    donationRepository,
    principal,
    {
      campaignId: idParsed.data,
      ...parsed.data,
    },
  )

  if (!result.success) {
    const statusMap = {
      UNAUTHENTICATED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
    } as const
    const messageMap = {
      UNAUTHENTICATED: 'Unauthenticated',
      FORBIDDEN: 'Forbidden',
      NOT_FOUND: 'Campaign not found',
    } as const
    return NextResponse.json(
      { message: messageMap[result.code] },
      { status: statusMap[result.code] },
    )
  }

  return NextResponse.json(result.data, { status: 200 })
}
