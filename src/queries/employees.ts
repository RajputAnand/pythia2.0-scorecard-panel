import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee, CreateEmployeeParams, CreateEmployeeResponse, EmployeeCredentials } from '@/types/employee'

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

export async function createEmployee({
  token,
  firstName,
  lastName,
  email,
  phone,
  images,
}: CreateEmployeeParams): Promise<CreateEmployeeResponse> {
  const form = new FormData()
  form.append('first_name', firstName)
  form.append('last_name', lastName)
  if (email) form.append('email', email)
  if (phone) form.append('phone', phone)
  images?.forEach((file) => form.append('images', file))

  const { data } = await pythia2Client.post<CreateEmployeeResponse>(
    PYTHIA_2_API.employees.create,
    form,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        // Unset the instance's default JSON content-type so axios sends the
        // FormData as-is and the browser can attach the correct multipart
        // boundary — otherwise axios JSON-stringifies the FormData instead.
        'Content-Type': undefined,
      },
    },
  )
  return data
}

export async function fetchEmployee({ token, userId }: { token: string; userId: string }): Promise<ApiEmployee> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<ApiEmployee>>(
    PYTHIA_2_API.employees.detail(userId),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

export async function deleteEmployee({ token, userId }: { token: string; userId: string }): Promise<void> {
  await pythia2Client.delete<ApiResponseV2<null>>(PYTHIA_2_API.employees.detail(userId), {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export interface FetchEmployeeCredentialsParams {
  token: string
  userId: string
}

export async function fetchEmployeeCredentials({
  token,
  userId,
}: FetchEmployeeCredentialsParams): Promise<EmployeeCredentials> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<EmployeeCredentials>>(
    PYTHIA_2_API.employees.credentials(userId),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}
