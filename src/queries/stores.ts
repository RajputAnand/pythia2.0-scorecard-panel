import { pythia1Client } from '@/lib/api-client'
import { PYTHIA_1_API } from '@/utils/api-endpoints'
import type { ApiResponseV1 } from '@/types/api'
import type { Store } from '@/types/store'

export async function fetchStores(token: string): Promise<Store[]> {
  const { data: response } = await pythia1Client.get<ApiResponseV1<Store[]>>(
    PYTHIA_1_API.store.list,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return (response.data ?? [])
}
