import { fakeGetAllStoreData, fakeGetNetworkIntelligence } from '@/mock/ownerRoiAPIs'
import type {
  BenchmarkingAllStoreDataResponse,
  BenchmarkingNetworkIntelligenceResponse,
} from '@/types/benchmarking'

export async function fetchAllStoreData(
  _token: string,
  _params: {
    period?: string
    sort_by?: string
    sort_order?: string
    selected_store_id?: string | null
    filter_mode?: string
    limit?: number
    offset?: number
  } = {}
): Promise<BenchmarkingAllStoreDataResponse> {
  return fakeGetAllStoreData()
}

export async function fetchNetworkIntelligence(
  _token: string,
  selectedStoreId: string,
  _period?: string
): Promise<BenchmarkingNetworkIntelligenceResponse> {
  return fakeGetNetworkIntelligence(selectedStoreId)
}
