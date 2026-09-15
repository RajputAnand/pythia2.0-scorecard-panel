import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

export interface FetchUnknownIdentitiesParams {
  token: string
  skip?: number
  limit?: number
  storeId?: string
}

export async function fetchUnknownIdentities({ token, skip = 0, limit = 50, storeId }: FetchUnknownIdentitiesParams) {
  if (token.includes('mock')) {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
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
  if (token.includes('mock')) return 0
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
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
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
    return { id: identityId, user_id: userId } as any
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
    return { id: identityId } as any
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
    return { id: identityId } as any
  }
  const { data: response } = await pythia2Client.post<ApiResponseV2<UnknownIdentity>>(
    PYTHIA_2_API.unknownIdentities.restore(identityId),
    undefined,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}
