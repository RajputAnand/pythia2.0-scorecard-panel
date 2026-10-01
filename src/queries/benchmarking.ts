import { pythia2Client } from '@/lib/api-client'
import { fakeGetAllStoreData, fakeGetNetworkIntelligence } from '@/mock/ownerRoiAPIs'
import type {
  BenchmarkingAllStoreDataResponse,
  BenchmarkingNetworkIntelligenceResponse,
} from '@/types/benchmarking'
import { PYTHIA_2_API } from '@/utils/api-endpoints'

export async function fetchAllStoreData(
  _token: string,
  _params?: {
    period?: string
    sort_by?: string
    sort_order?: string
    selected_store_id?: string | null
    filter_mode?: string
    limit?: number
    offset?: number
  }
): Promise<BenchmarkingAllStoreDataResponse> {
  return fakeGetAllStoreData()
}

export interface FetchBenchmarkAllStoresParams {
  token?: string
  tenantId?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
  signal?: AbortSignal
  filter_mode?: string
  selectedStoreId: string | null
}


export async function fetchNetworkIntelligence(
  _token: string,
  selectedStoreId: string,
  _period?: string
): Promise<BenchmarkingNetworkIntelligenceResponse> {
  return fakeGetNetworkIntelligence(selectedStoreId)
}

export async function fetchBenchmarkAllStoreData({
  token,
  search,
  status,
  skip = 0,
  limit = 20,
  signal,
  filter_mode,
  selectedStoreId
}: FetchBenchmarkAllStoresParams): Promise<BenchmarkingAllStoreDataResponse> {
  if (token?.includes('demo-mock')) {
    return fakeGetAllStoreData()
  }
  if (!token) {
    return {
      success: true,
      meta: {
        metric: 'overall',
        sort_order: 'desc',
        period: { start_local: '', end_local_exclusive: '', label: '', timezone: '' },
        comparison_period: { label: '' },
        scope: { type: 'all_stores', store_count: 0, store_id: null },
        filter: { mode: 'all', display_total: 0, selected_store_id: '' },
        total: 0,
        offset: skip,
        limit,
      },
      selected_store: null,
      data: [],
    }
  }

  const { data: response } = await pythia2Client.get<any>(
    PYTHIA_2_API.benchmarking.allStoreData,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        search: search || undefined,
        skip,
        limit,
        filter_mode,
        ...(filter_mode === "near_you" && {selected_store_id: selectedStoreId})
      },
      signal,
    },
  )

  const mapped = (response?.data || []) as any[]
  return {
    success: response?.success ?? true,
    meta: response?.meta && 'period' in response.meta ? response.meta : {
      metric: response?.meta?.metric || 'overall',
      sort_order: response?.meta?.sort_order || 'desc',
      period: response?.meta?.period || { start_local: '', end_local_exclusive: '', label: '', timezone: '' },
      comparison_period: response?.meta?.comparison_period || { label: '' },
      scope: response?.meta?.scope || { type: 'all_stores', store_count: mapped.length, store_id: null },
      filter: response?.meta?.filter || { mode: 'all', display_total: mapped.length, selected_store_id: '' },
      total: response?.meta?.total ?? mapped.length,
      offset: response?.meta?.offset ?? response?.meta?.skip ?? skip,
      limit: response?.meta?.limit ?? limit,
    },
    selected_store: response?.selected_store ?? null,
    data: mapped,
  }
}
