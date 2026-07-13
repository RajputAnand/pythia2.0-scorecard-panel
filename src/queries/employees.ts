import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'

export interface FetchEmployeesParams {
  token: string
  search?: string
  skip?: number
  limit?: number
}

export async function fetchEmployees({ token, search, skip = 0, limit = 8 }: FetchEmployeesParams) {
  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<ApiEmployee[]>>(
    PYTHIA_2_API.employees.list,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: search || undefined, skip, limit },
    },
  )
  return response
}
