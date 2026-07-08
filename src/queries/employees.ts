import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee } from '@/types/employee'
import { queryKeys } from './keys'

export interface FetchEmployeesParams {
  token: string
  search?: string
  skip?: number
  limit?: number
}

// Called from a client component (EmployeeAssignPicker), so this goes through
// the same-origin /api/employees proxy rather than pythia2Client directly —
// the Pythia-2 backend is plain HTTP and the browser blocks it as mixed
// content on the HTTPS-deployed app.
export async function fetchEmployees({ token, search, skip = 0, limit = 8 }: FetchEmployeesParams) {
  const params = new URLSearchParams({ skip: String(skip), limit: String(limit) })
  if (search) params.set('search', search)

  const res = await fetch(`/api/employees?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const response: ApiResponseV2Paginated<ApiEmployee[]> = await res.json()
  if (!res.ok) throw new Error(response.message || 'Failed to fetch employees')
  return response
}

export function useEmployeesQuery({ token, search, skip = 0, limit = 8 }: FetchEmployeesParams) {
  return useQuery({
    queryKey: queryKeys.employees.list({ search, skip, limit }),
    queryFn: () => fetchEmployees({ token, search, skip, limit }),
    enabled: !!token,
    staleTime: 60 * 1000,
    // Keep showing the previous page's results while the next page loads —
    // avoids the dropdown flashing empty on every page/search change.
    placeholderData: keepPreviousData,
  })
}
