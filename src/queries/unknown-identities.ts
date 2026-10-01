import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

const MOCK_IDENTITIES: UnknownIdentity[] = [
  { id: 'demo-unknown-201', name: 'Unknown Visitor 201', role: 'unknown', store_id: 'STORE-001', device_id: 'CAM-ENTRANCE-01', session_id: 'demo-session-201', video_source: 'demo/videos/entrance-201.mp4', status: 'unresolved', user_id: null, images: [{ s3_bucket: 'demo-media', s3_key: 'demo/faces/unknown-201.jpg', photo_index: 0, embedding_id: 'demo-embedding-201', captured_at_utc: '2026-05-12T09:22:00Z' }], embeddings: [{ embedding_id: 'demo-embedding-201', path: 'demo/embeddings/201.npy', dim: 512, model: 'demo-face-v1' }] },
  { id: 'demo-unknown-202', name: 'Unknown Visitor 202', role: 'unknown', store_id: 'STORE-001', device_id: 'CAM-REGISTER-02', session_id: 'demo-session-202', video_source: 'demo/videos/register-202.mp4', status: 'unresolved', user_id: null, images: [{ s3_bucket: 'demo-media', s3_key: 'demo/faces/unknown-202.jpg', photo_index: 0, embedding_id: 'demo-embedding-202', captured_at_utc: '2026-05-12T11:45:00Z' }], embeddings: [{ embedding_id: 'demo-embedding-202', path: 'demo/embeddings/202.npy', dim: 512, model: 'demo-face-v1' }] },
  { id: 'demo-unknown-203', name: 'Unknown Visitor 203', role: 'unknown', store_id: 'STORE-001', device_id: 'CAM-FITTING-03', session_id: 'demo-session-203', video_source: 'demo/videos/fitting-203.mp4', status: 'trashed', user_id: null, trashed_at_utc: '2026-05-13T16:10:00Z', images: [{ s3_bucket: 'demo-media', s3_key: 'demo/faces/unknown-203.jpg', photo_index: 0, embedding_id: 'demo-embedding-203', captured_at_utc: '2026-05-13T16:08:00Z' }], embeddings: [{ embedding_id: 'demo-embedding-203', path: 'demo/embeddings/203.npy', dim: 512, model: 'demo-face-v1' }] },
]

function mockIdentities(storeId?: string) {
  return MOCK_IDENTITIES.filter((identity) => !storeId || identity.store_id === storeId)
}

export interface FetchUnknownIdentitiesParams {
  token: string
  skip?: number
  limit?: number
  storeId?: string
}

export async function fetchUnknownIdentities({ token, skip = 0, limit = 50, storeId }: FetchUnknownIdentitiesParams) {
  if (token.includes('mock')) {
    const identities = mockIdentities(storeId).filter((identity) => identity.status === 'unresolved')
    return {
      success: true,
      meta: { total: identities.length, skip, limit },
      data: identities.slice(skip, skip + limit),
    }
  }
  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
    PYTHIA_2_API.unknownIdentities.list,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { skip, limit, store_id: storeId || undefined },
    },
  )
  return response
}

export async function fetchUnknownIdentitiesCount({ token, storeId }: { token: string; storeId?: string }): Promise<number> {
  if (token.includes('mock')) return mockIdentities(storeId).filter((identity) => identity.status === 'unresolved').length
  const { data } = await pythia2Client.get<{ success: boolean; total: number }>(
    PYTHIA_2_API.unknownIdentities.count,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { store_id: storeId || undefined },
    },
  )
  return data.total
}

export async function fetchTrashedIdentities({ token, skip = 0, limit = 50, storeId }: FetchUnknownIdentitiesParams) {
  if (token.includes('mock')) {
    const identities = mockIdentities(storeId).filter((identity) => identity.status === 'trashed')
    return {
      success: true,
      meta: { total: identities.length, skip, limit },
      data: identities.slice(skip, skip + limit),
    }
  }
  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
    PYTHIA_2_API.unknownIdentities.trashed,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { skip, limit, store_id: storeId || undefined },
    },
  )
  return response
}

export interface AssignUnknownIdentityParams {
  token: string
  identityId: string
  userId: string
}

export async function assignUnknownIdentity({ token, identityId, userId }: AssignUnknownIdentityParams) {
  if (token.includes('mock')) {
    const identity = MOCK_IDENTITIES.find((item) => item.id === identityId)
    if (!identity) throw new Error('Demo identity not found')
    identity.status = 'resolved'
    identity.user_id = userId
    return identity
  }
  const { data: response } = await pythia2Client.post<ApiResponseV2<UnknownIdentity>>(
    PYTHIA_2_API.unknownIdentities.assign(identityId),
    undefined,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { user_id: userId },
    },
  )
  return response.data
}

export interface TrashUnknownIdentityParams {
  token: string
  identityId: string
}

export async function trashUnknownIdentity({ token, identityId }: TrashUnknownIdentityParams) {
  if (token.includes('mock')) {
    const identity = MOCK_IDENTITIES.find((item) => item.id === identityId)
    if (!identity) throw new Error('Demo identity not found')
    identity.status = 'trashed'
    identity.trashed_at_utc = new Date().toISOString()
    return identity
  }
  const { data: response } = await pythia2Client.post<ApiResponseV2<UnknownIdentity>>(
    PYTHIA_2_API.unknownIdentities.trash(identityId),
    undefined,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

export async function restoreUnknownIdentity({ token, identityId }: TrashUnknownIdentityParams) {
  if (token.includes('mock')) {
    const identity = MOCK_IDENTITIES.find((item) => item.id === identityId)
    if (!identity) throw new Error('Demo identity not found')
    identity.status = 'unresolved'
    identity.trashed_at_utc = null
    return identity
  }
  const { data: response } = await pythia2Client.post<ApiResponseV2<UnknownIdentity>>(
    PYTHIA_2_API.unknownIdentities.restore(identityId),
    undefined,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}
