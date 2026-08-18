import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import {
  BenchmarkingAllStoreDataResponse,
  BenchmarkingNetworkIntelligenceResponse,
} from '@/types/benchmarking'

export async function fetchAllStoreData(
  token: string,
  params: {
    period?: string
    sort_by?: string
    sort_order?: string
    selected_store_id?: string | null
    filter_mode?: string
    limit?: number
    offset?: number
  } = {}
) {
  // Filter out undefined and null values
  const queryParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value))
    }
  })

  const queryString = queryParams.toString()
  const url = `${PYTHIA_2_API.benchmarking.allStoreData}${queryString ? `?${queryString}` : ''}`

  const { data } = await pythia2Client.get<BenchmarkingAllStoreDataResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

export async function fetchNetworkIntelligence(
  token: string,
  selectedStoreId: string,
  period?: string
) {
  const queryParams = new URLSearchParams()
  queryParams.append('selected_store_id', selectedStoreId)
  if (period) {
    queryParams.append('period', period)
  }

  const url = `${PYTHIA_2_API.benchmarking.networkIntelligence}?${queryParams.toString()}`

  const { data } = await pythia2Client.get<BenchmarkingNetworkIntelligenceResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}
