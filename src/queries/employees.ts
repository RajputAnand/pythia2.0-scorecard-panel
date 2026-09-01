import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type { ApiEmployee, CreateEmployeeParams, CreateEmployeeResponse, EmployeeCredentials } from '@/types/employee'

const MOCK_EMPLOYEES: ApiEmployee[] = [
  {
    _id: 'EMP-101',
    user_id: 'EMP-101',
    first_name: 'Marcus',
    last_name: 'Rivera',
    email: 'marcus.4821@lionmart.com',
    phone: '+1 555-0101',
    role_name: 'employee',
    store_ids: ['STORE-001'],
    device_id: null,
    is_active: true,
  },
  {
    _id: 'EMP-102',
    user_id: 'EMP-102',
    first_name: 'Jessica',
    last_name: 'Chen',
    email: 'jessica.chen@lionmart.com',
    phone: '+1 555-0102',
    role_name: 'employee',
    store_ids: ['STORE-001'],
    device_id: null,
    is_active: true,
  },
  {
    _id: 'EMP-103',
    user_id: 'EMP-103',
    first_name: 'David',
    last_name: 'Kim',
    email: 'david.kim@lionmart.com',
    phone: '+1 555-0103',
    role_name: 'employee',
    store_ids: ['STORE-001'],
    device_id: null,
    is_active: true,
  },
]

export interface FetchEmployeesParams {
  token: string
  search?: string
  skip?: number
  limit?: number
}

export async function fetchEmployees({ token, search, skip = 0, limit = 8 }: FetchEmployeesParams) {
  if (token.includes('mock')) {
    const term = (search || '').toLowerCase()
    const filtered = MOCK_EMPLOYEES.filter(
      (e) => !term || (e.first_name || '').toLowerCase().includes(term) || (e.last_name || '').toLowerCase().includes(term)
    )
    return {
      success: true,
      meta: { total: filtered.length, skip, limit },
      data: filtered.slice(skip, skip + limit),
    }
  }

  try {
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<ApiEmployee[]>>(
      PYTHIA_2_API.employees.list,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: search || undefined, skip, limit },
      },
    )
    return response
  } catch {
    return {
      success: true,
      meta: { total: MOCK_EMPLOYEES.length, skip, limit },
      data: MOCK_EMPLOYEES.slice(skip, skip + limit),
    }
  }
}

export async function fetchArchivedEmployees({ token, skip = 0, limit = 8 }: FetchEmployeesParams) {
  if (token.includes('mock')) {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
  try {
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<ApiEmployee[]>>(
      PYTHIA_2_API.employees.archived,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: { skip, limit },
      },
    )
    return response
  } catch {
    return {
      success: true,
      meta: { total: 0, skip, limit },
      data: [],
    }
  }
}

export async function createEmployee({
  token,
  firstName,
  lastName,
  email,
  phone,
  images,
}: CreateEmployeeParams): Promise<CreateEmployeeResponse> {
  if (token.includes('mock')) {
    const userId = `EMP-${Math.floor(100 + Math.random() * 900)}`
    return {
      success: true,
      user_id: userId,
      temp_password: 'emp-temp-1234',
      email_sent: true,
      images: [],
      message: 'Employee created successfully in mock environment.',
    }
  }
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
        'Content-Type': undefined,
      },
    },
  )
  return data
}

export async function fetchEmployee({ token, userId }: { token: string; userId: string }): Promise<ApiEmployee> {
  if (token.includes('mock')) {
    return MOCK_EMPLOYEES.find((e) => e.user_id === userId) || MOCK_EMPLOYEES[0]
  }
  const { data: response } = await pythia2Client.get<ApiResponseV2<ApiEmployee>>(
    PYTHIA_2_API.employees.detail(userId),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}

export async function archiveEmployee({ token, userId }: { token: string; userId: string }): Promise<void> {
  if (token.includes('mock')) return
  await pythia2Client.post<ApiResponseV2<null>>(PYTHIA_2_API.employees.archive(userId), null, {
    headers: { Authorization: `Bearer ${token}` },
  })
}

export async function unarchiveEmployee({ token, userId }: { token: string; userId: string }): Promise<void> {
  if (token.includes('mock')) return
  await pythia2Client.post<ApiResponseV2<null>>(PYTHIA_2_API.employees.unarchive(userId), null, {
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
  if (token.includes('mock')) {
    return { user_id: userId, temp_password: 'emp-temp-1234' }
  }
  const { data: response } = await pythia2Client.get<ApiResponseV2<EmployeeCredentials>>(
    PYTHIA_2_API.employees.credentials(userId),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return response.data
}
