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

// Used for both the server-side prefetch in page.tsx (direct pythia2Client
// call — Node has no mixed-content restriction) and the client-side
// background refetch via useUnknownIdentitiesQuery, which must instead go
// through the same-origin /api/unknown-identities proxy since the Pythia-2
// backend is plain HTTP and the browser blocks it on the HTTPS-deployed app.
export async function fetchUnknownIdentities({ token, skip = 0, limit = 50 }: FetchUnknownIdentitiesParams) {
  if (typeof window === 'undefined') {
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<UnknownIdentity[]>>(
      PYTHIA_2_API.unknownIdentities.list,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      },
    )
    return response
  }

  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
  const res = await fetch(`/api/unknown-identities?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const response: ApiResponseV2Paginated<UnknownIdentity[]> = await res.json()
  if (!res.ok) throw new Error(response.message || 'Failed to fetch unknown identities')
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

// Called only from a client component (EmployeeAssignPicker), so this goes
// through the same-origin proxy — see fetchUnknownIdentities above.
export async function assignUnknownIdentity({ token, identityId, userId }: AssignUnknownIdentityParams) {
  const params = new URLSearchParams({ user_id: userId })
  const res = await fetch(`/api/unknown-identities/${identityId}/assign?${params.toString()}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  const response: ApiResponseV2<UnknownIdentity> = await res.json()
  if (!res.ok) throw new Error(response.message || 'Failed to assign identity')
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
