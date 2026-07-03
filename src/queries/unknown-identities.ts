import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { UnknownIdentity } from '@/types/unknown-identity'
import { queryKeys } from './keys'

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

export function useUnknownIdentitiesQuery(token?: string) {
  return useQuery({
    queryKey: queryKeys.unknownIdentities.list(),
    queryFn: () => fetchUnknownIdentities({ token: token! }),
    enabled: !!token,
    staleTime: 60 * 1000,
  })
}

export interface AssignUnknownIdentityParams {
  token: string
  identityId: string
  userId: string
}

export async function assignUnknownIdentity({ token, identityId, userId }: AssignUnknownIdentityParams) {
  const { data: response } = await pythia2Client.get<ApiResponseV2<UnknownIdentity>>(
    PYTHIA_2_API.unknownIdentities.assign(identityId),
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { user_id: userId },
    },
  )
  return response.data
}

export function useAssignUnknownIdentity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: assignUnknownIdentity,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.unknownIdentities.all })
    },
  })
}
