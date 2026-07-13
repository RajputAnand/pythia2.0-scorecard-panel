export interface ApiResponseV2<T> {
  success: boolean
  message?: string
  data: T
}

export interface ApiMeta {
  total: number
  skip: number
  limit: number
}

// Pythia-2 backend — paginated list endpoints (e.g. /employees, /unknown-identities)
export interface ApiResponseV2Paginated<T> {
  success: boolean
  message?: string
  meta: ApiMeta
  data: T
}
