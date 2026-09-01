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
  startDate?: string
  endDate?: string
}

export async function fetchVideoIdentities({
  token,
  skip = 0,
  limit = 50,
  status,
  search,
  startDate,
  endDate,
}: FetchVideoIdentitiesParams): Promise<ApiResponseV2Paginated<VideoIdentityEntry[]>> {
  if (token.includes('mock')) {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiResponseV2Paginated<VideoIdentityEntry[]>>(
      PYTHIA_2_API.videoIdentities.list,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          skip,
          limit,
          status,
          search: search || undefined,
          start_date: startDate || undefined,
          end_date: endDate || undefined,
        },
      }
    )
    return data
  } catch {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
}

export async function fetchVideoIdentityStats({ token }: { token: string }): Promise<VideoIdentityStats> {
  if (token.includes('mock')) {
    return {
      total_videos: 0,
      identities_matched: 0,
      unmatched: 0,
      avg_similarity: null,
    }
  }
  try {
    const { data } = await pythia2Client.get<ApiResponseV2<VideoIdentityStats>>(PYTHIA_2_API.videoIdentities.stats, {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data.data
  } catch {
    return {
      total_videos: 0,
      identities_matched: 0,
      unmatched: 0,
      avg_similarity: null,
    }
  }
}

export interface PresignedKey {
  key: string
  url: string
}

export async function presignVideoIdentityKeys({
  token,
  keys,
}: {
  token: string
  keys: string[]
}): Promise<PresignedKey[]> {
  if (token.includes('mock')) {
    return keys.map((k) => ({ key: k, url: '' }))
  }
  try {
    const { data } = await pythia2Client.post<ApiResponseV2<PresignedKey[]>>(
      PYTHIA_2_API.videoIdentities.presign,
      { keys },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return data.data
  } catch {
    return keys.map((k) => ({ key: k, url: '' }))
  }
}
