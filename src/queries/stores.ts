import { useQuery } from '@tanstack/react-query'
import { pythia1Client } from '@/lib/api-client'
import { PYTHIA_1_API } from '@/utils/api-endpoints'
import type { ApiResponseV1 } from '@/types/api'
import type { Store } from '@/types/store'
import { queryKeys } from './keys'

async function fetchStores(token: string): Promise<Store[]> {
  const { data: response } = await pythia1Client.get<ApiResponseV1<Store[]>>(
    PYTHIA_1_API.store.list,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return (response.data ?? [])
}

export function useStoresQuery(token?: string) {
  return useQuery({
    queryKey: queryKeys.stores.list(token),
    queryFn: () => fetchStores(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000,
    // gcTime: 0 — drop the cache the moment the Header unmounts (logout / login redirect).
    // This guarantees a fresh fetch on every login, even if the token hasn't changed.
    gcTime: 0,
  })
}
