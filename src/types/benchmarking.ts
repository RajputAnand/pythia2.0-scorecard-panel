export interface BenchmarkingStoreData {
  store_id: string
  overall: number | null
  hospitality: number | null
  checkout: number | null
  time_to_svc: number | null
  mom_change: string | number | null
  percentile: string | number | null
}

export interface BenchmarkingAllStoreDataResponse {
  success: boolean
  data: BenchmarkingStoreData[]
}

export interface BenchmarkingFetchStoreDataResponse {
  success: boolean
  data: BenchmarkingStoreData[]
}
