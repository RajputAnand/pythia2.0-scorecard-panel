import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { RoiAttributionParams, RoiAttributionResponse } from '@/types/owner-roi'
import type { ShareRoiAttributionPdfParams, ShareRoiAttributionPdfResponse } from '@/types/owner-roi'

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

export async function shareRoiAttributionPdf({
  token,
  toEmail,
  note,
  senderName,
  pdfFile,
}: ShareRoiAttributionPdfParams): Promise<ShareRoiAttributionPdfResponse> {
  const form = new FormData()
  form.append('to_email', toEmail)
  if (note) form.append('note', note)
  if (senderName) form.append('sender_name', senderName)
  form.append('pdf', pdfFile)

  const { data } = await pythia2Client.post<ShareRoiAttributionPdfResponse>(
    PYTHIA_2_API.roi.shareWithInvestor,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Unset the instance's default JSON content-type so axios sends the
        // FormData as-is and the browser can attach the correct multipart
        // boundary — otherwise axios JSON-stringifies the FormData instead.
        'Content-Type': undefined,
      },
    },
  )
  return data
}
