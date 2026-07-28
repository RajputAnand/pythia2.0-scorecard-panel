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
  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
    PYTHIA_2_API.unknownIdentities.list,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { skip, limit },
    },
  )
  return response
}

export async function fetchUnknownIdentitiesCount({ token }: { token: string }): Promise<number> {
  const { data } = await pythia2Client.get<{ success: boolean; total: number }>(
    PYTHIA_2_API.unknownIdentities.count,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return data.total
}

export interface AssignUnknownIdentityParams {
  token: string
  identityId: string
  userId: string
}

export async function assignUnknownIdentity({ token, identityId, userId }: AssignUnknownIdentityParams) {
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
