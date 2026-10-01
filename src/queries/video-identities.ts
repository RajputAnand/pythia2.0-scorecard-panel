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

const MOCK_VIDEO_IDENTITIES: VideoIdentityEntry[] = [
  {
    video_key: 'demo/videos/front-entrance-2026-05-12.mp4', video_bucket: 'demo-media', store_id: 'STORE-001',
    device_id: 'CAM-ENTRANCE-01', session_id: 'demo-session-101', recorded_at: '2026-05-12T09:14:00Z',
    matches: [{ id: 'demo-match-101', user_id: 'demo-employee-101', employee_name: 'Marcus Rivera', job_title: 'Sales Associate', status: 'identified', reason: 'identified', similarity: 0.94, margin: 0.18, images: [{ bucket: 'demo-media', key: 'demo/faces/marcus-rivera.jpg' }], created_at: '2026-05-12T09:14:22Z' }],
  },
  {
    video_key: 'demo/videos/register-2026-05-12.mp4', video_bucket: 'demo-media', store_id: 'STORE-001',
    device_id: 'CAM-REGISTER-02', session_id: 'demo-session-102', recorded_at: '2026-05-12T11:32:00Z',
    matches: [{ id: 'demo-match-102', user_id: null, employee_name: null, job_title: null, status: 'unknown', reason: 'ambiguous_margin', similarity: 0.61, margin: 0.04, images: [{ bucket: 'demo-media', key: 'demo/faces/unmatched-102.jpg' }], created_at: '2026-05-12T11:32:18Z' }],
  },
  {
    video_key: 'demo/videos/fitting-room-2026-05-13.mp4', video_bucket: 'demo-media', store_id: 'STORE-001',
    device_id: 'CAM-FITTING-03', session_id: 'demo-session-103', recorded_at: '2026-05-13T14:05:00Z',
    matches: [{ id: 'demo-match-103', user_id: 'demo-employee-102', employee_name: 'Jessica Chen', job_title: 'Shift Lead', status: 'identified', reason: 'identified', similarity: 0.89, margin: 0.12, images: [{ bucket: 'demo-media', key: 'demo/faces/jessica-chen.jpg' }], created_at: '2026-05-13T14:05:27Z' }],
  },
]

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
    const query = search?.toLowerCase().trim()
    const filtered = MOCK_VIDEO_IDENTITIES.filter((entry) =>
      (!status || entry.matches.some((match) => match.status === status)) &&
      (!query || [entry.device_id, entry.session_id, ...entry.matches.map((match) => match.employee_name ?? '')].some((value) => value.toLowerCase().includes(query))) &&
      (!startDate || entry.recorded_at >= startDate) && (!endDate || entry.recorded_at <= `${endDate}T23:59:59.999Z`)
    )
    return {
      success: true,
      meta: { total: filtered.length, skip, limit },
      data: filtered.slice(skip, skip + limit),
    }
  }
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
}

export async function fetchVideoIdentityStats({ token }: { token: string }): Promise<VideoIdentityStats> {
  if (token.includes('mock')) {
    return {
      total_videos: MOCK_VIDEO_IDENTITIES.length,
      identities_matched: 2,
      unmatched: 1,
      avg_similarity: 0.915,
    }
  }
  const { data } = await pythia2Client.get<ApiResponseV2<VideoIdentityStats>>(PYTHIA_2_API.videoIdentities.stats, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data.data
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
  const { data } = await pythia2Client.post<ApiResponseV2<PresignedKey[]>>(
    PYTHIA_2_API.videoIdentities.presign,
    { keys },
    { headers: { Authorization: `Bearer ${token}` } }
  )
  return data.data
}
