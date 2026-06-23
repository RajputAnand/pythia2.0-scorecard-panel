export interface ApiResponseV1<T> {
  statusCode: number
  message: string
  data: T
}

export interface ApiResponseV2<T> {
  success: boolean
  message?: string
  data: T
}
