import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type {
  ApiManager,
  CreateManagerParams,
  CreateManagerResponse,
  ManagerCredentials,
} from '@/types/manager'
import {
  fakeListManagers,
  fakeListArchivedManagers,
  fakeCreateManager,
  fakeGetManagerCredentials,
  fakeArchiveManager,
  fakeUnarchiveManager,
} from '@/mock/managerAPIs'

export interface FetchManagersParams {
  token: string
  search?: string
  skip?: number
  limit?: number
  storeId?: string
}

export async function fetchManagers({
  token,
  search,
  skip = 0,
  limit = 15,
  storeId,
}: FetchManagersParams): Promise<ApiResponseV2Paginated<ApiManager[]>> {
  if (token.includes('mock')) {
    return fakeListManagers({ search, skip, limit })
  }

  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<ApiManager[]>>(
    PYTHIA_2_API.managers.list,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: search || undefined, skip, limit, store_id: storeId || undefined },
    },
  )
  return response
}

export async function fetchArchivedManagers({
  token,
  search,
  skip = 0,
  limit = 15,
  storeId,
}: FetchManagersParams): Promise<ApiResponseV2Paginated<ApiManager[]>> {
  if (token.includes('mock')) {
    return fakeListArchivedManagers({ search, skip, limit })
  }

  const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<ApiManager[]>>(
    PYTHIA_2_API.managers.archived,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: search || undefined, skip, limit, store_id: storeId || undefined },
    },
  )
  return response
}

export async function createManager({
  token,
  firstName,
  lastName,
  email,
  phone,
  storeIds,
}: CreateManagerParams): Promise<CreateManagerResponse> {
  if (token.includes('mock')) {
    return fakeCreateManager({ firstName, lastName, email, phone, storeIds })
  }

  const { data: response } = await pythia2Client.post<CreateManagerResponse>(
    PYTHIA_2_API.managers.create,
    {
      first_name: firstName,
      last_name: lastName,
      email: email || undefined,
      phone: phone || undefined,
      store_ids: storeIds,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response
}

export async function fetchManager({
  token,
  userId,
}: {
  token: string
  userId: string
}): Promise<ApiManager> {
  const { data: response } = await pythia2Client.get<ApiResponseV2<ApiManager>>(
    PYTHIA_2_API.managers.detail(userId),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

export async function updateManager({
  token,
  userId,
  data,
}: {
  token: string
  userId: string
  data: Partial<ApiManager>
}): Promise<ApiManager> {
  const { data: response } = await pythia2Client.put<ApiResponseV2<ApiManager>>(
    PYTHIA_2_API.managers.detail(userId),
    data,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

export async function fetchManagerCredentials({
  token,
  userId,
}: {
  token: string
  userId: string
}): Promise<ManagerCredentials> {
  if (token.includes('mock')) {
    return fakeGetManagerCredentials(userId)
  }

  const { data: response } = await pythia2Client.get<ApiResponseV2<ManagerCredentials>>(
    PYTHIA_2_API.managers.credentials(userId),
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  return response.data
}

export async function archiveManager({
  token,
  userId,
}: {
  token: string
  userId: string
}): Promise<void> {
  if (token.includes('mock')) {
    return fakeArchiveManager(userId)
  }

  await pythia2Client.post(
    PYTHIA_2_API.managers.archive(userId),
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}

export async function unarchiveManager({
  token,
  userId,
}: {
  token: string
  userId: string
}): Promise<void> {
  if (token.includes('mock')) {
    return fakeUnarchiveManager(userId)
  }

  await pythia2Client.post(
    PYTHIA_2_API.managers.unarchive(userId),
    null,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
}
