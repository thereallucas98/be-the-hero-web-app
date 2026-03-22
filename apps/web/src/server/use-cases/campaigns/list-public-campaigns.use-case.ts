import type {
  CampaignRepository,
  ListPublicCampaignsInput,
  ListPublicCampaignsResult,
} from '../../repositories/campaign.repository'

export type ListPublicCampaignsUseCaseResult = {
  success: true
  data: ListPublicCampaignsResult
}

export async function listPublicCampaigns(
  campaignRepo: CampaignRepository,
  input: ListPublicCampaignsInput,
): Promise<ListPublicCampaignsUseCaseResult> {
  const data = await campaignRepo.listPublic(input)
  return { success: true, data }
}
