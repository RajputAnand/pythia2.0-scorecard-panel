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
  period_type = 'month',
  custom_start,
  custom_end,
  view = 'both',
}: FetchRoiAttributionParams): Promise<RoiAttributionResponse> {
  // Pure mock layer for frontend-only / WIP backend operation
  return fakeGetRoiAttribution({
    period_type,
    custom_start,
    custom_end,
    view,
  })
}

export async function shareRoiAttributionPdf({
  toEmail,
}: ShareRoiAttributionPdfParams): Promise<ShareRoiAttributionPdfResponse> {
  return {
    success: true,
    message: `Report successfully dispatched to ${toEmail}.`,
  }
}
