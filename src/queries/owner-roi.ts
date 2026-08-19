import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { RoiAttributionParams, RoiAttributionResponse } from '@/types/owner-roi'

export interface FetchRoiAttributionParams extends RoiAttributionParams {
  token: string
}

export async function fetchRoiAttribution({
  token,
  period_type = 'month',
  custom_start,
  custom_end,
  view = 'both',
}: FetchRoiAttributionParams): Promise<RoiAttributionResponse> {
  const { data } = await pythia2Client.get<RoiAttributionResponse>(PYTHIA_2_API.roi.attribution, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      period_type,
      custom_start,
      custom_end,
      view,
    },
  })
  return data
}
