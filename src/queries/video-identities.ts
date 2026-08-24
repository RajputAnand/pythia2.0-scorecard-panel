import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { VideoIdentityEntry, VideoIdentityStats, VideoIdentityStatus } from '@/types/video-identity'

interface FetchVideoIdentitiesParams {
  token: string
  skip?: number
  limit?: number
  status?: VideoIdentityStatus
  search?: string
}

export async function fetchVideoIdentities({
  token,
  skip = 0,
  limit = 50,
  status,
  search,
}: FetchVideoIdentitiesParams): Promise<ApiResponseV2Paginated<VideoIdentityEntry[]>> {
  const { data } = await pythia2Client.get<ApiResponseV2Paginated<VideoIdentityEntry[]>>(
    PYTHIA_2_API.videoIdentities.list,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        skip,
        limit,
        status,
        search: search || undefined,
      },
    }
  )
  return data
}

export async function fetchVideoIdentityStats({ token }: { token: string }): Promise<VideoIdentityStats> {
  const { data } = await pythia2Client.get<ApiResponseV2<VideoIdentityStats>>(PYTHIA_2_API.videoIdentities.stats, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.data
}

export interface PresignedKey {
  key: string
  url: string
}

/**
 * Presigns video/image S3 keys on demand — call only when the user actually
 * opens a video or its photos, not eagerly for every listed row. Keys the
 * caller isn't allowed to view are silently omitted from the result, so the
 * response may come back shorter than `keys`.
 */
export async function presignVideoIdentityKeys({
  token,
  keys,
}: {
  token: string
  keys: string[]
}): Promise<PresignedKey[]> {
  const { data } = await pythia2Client.post<ApiResponseV2<PresignedKey[]>>(
    PYTHIA_2_API.videoIdentities.presign,
    { keys },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.data
}
