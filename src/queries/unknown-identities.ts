import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'

export interface FetchUnknownIdentitiesParams {
  token: string
  skip?: number
  limit?: number
}

export async function fetchUnknownIdentities({ token, skip = 0, limit = 50 }: FetchUnknownIdentitiesParams) {
  if (token.includes('mock')) {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
  try {
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
      PYTHIA_2_API.unknownIdentities.list,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      },
    )
    return response
  } catch {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
}

export async function fetchUnknownIdentitiesCount({ token }: { token: string }): Promise<number> {
  if (token.includes('mock')) return 0
  try {
    const { data } = await pythia2Client.get<{ success: boolean; total: number }>(
      PYTHIA_2_API.unknownIdentities.count,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return data.total
  } catch {
    return 0
  }
}

export async function fetchTrashedIdentities({ token, skip = 0, limit = 50 }: FetchUnknownIdentitiesParams) {
  if (token.includes('mock')) {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
  try {
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
      PYTHIA_2_API.unknownIdentities.trashed,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      },
    )
    return response
  } catch {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
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
