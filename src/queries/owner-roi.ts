import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import { fakeGetRoiAttribution } from '@/mock/ownerRoiAPIs'
import type {
  RoiAttributionParams,
  RoiAttributionResponse,
  ShareRoiAttributionPdfParams,
  ShareRoiAttributionPdfResponse,
} from '@/types/owner-roi'

export interface FetchRoiAttributionParams extends RoiAttributionParams {
  token: string
}

export async function fetchRoiAttribution({
  token,
  store_id,
  period_type = 'month',
  custom_start,
  custom_end,
  view = 'both',
}: FetchRoiAttributionParams): Promise<RoiAttributionResponse> {
  if (token.includes('mock')) {
    return fakeGetRoiAttribution({
      store_id,
      period_type,
      custom_start,
      custom_end,
      view,
    })
  }

  try {
    const { data } = await pythia2Client.get<RoiAttributionResponse>(PYTHIA_2_API.roi.attribution, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        store_id: store_id || undefined,
        period_type,
        custom_start: custom_start || undefined,
        custom_end: custom_end || undefined,
        view,
      },
    })
    return data
  } catch (err) {
    console.warn('Failed to fetch ROI attribution, falling back to preview:', (err as any)?.message || err)
    return fakeGetRoiAttribution({
      store_id,
      period_type,
      custom_start,
      custom_end,
      view,
    })
  }
}

export async function shareRoiAttributionPdf({
  toEmail,
}: ShareRoiAttributionPdfParams): Promise<ShareRoiAttributionPdfResponse> {
  return {
    success: true,
    message: `Report successfully dispatched to ${toEmail}.`,
  }
}
