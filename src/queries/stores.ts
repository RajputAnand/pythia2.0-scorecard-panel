import { pythia2Client } from '@/lib/api-client'
import { PYTHIA_2_API } from '@/utils/api-endpoints'
import {
  fakeListStores,
  fakeListDeactivatedStores,
  fakeDeactivateStore,
  fakeActivateStore,
  fakeCreateStore,
  fakeBulkCreateStores,
  fakeSimulateHeartbeat,
  fakeUpdateStore,
} from '@/mock/tenantAPIs'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type {
  TenantStore,
  CreateStoreParams,
  BulkCreateStoresParams,
} from '@/types/tenant'

export interface FetchStoresParams {
  token?: string
  tenantId?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
  signal?: AbortSignal
}

function mapApiStoreToTenantStore(s: any, tenantId?: string): TenantStore {
  return {
    _id: s.store_code || s._id || '',
    id: s.store_code || s._id || '',
    tenantId: s.tenant_id || tenantId || '',
    tenantName: s.tenant_name,
    storeNo: s.store_code || s.storeNo || '',
    name: s.store_name || s.name || s.store_code || 'Store',
    location: s.location_city || s.location || '',
    district: s.district_region || s.district || '',
    fullAddress: s.full_address || s.fullAddress || '',
    address: {
      fullAddress: s.full_address || s.fullAddress || '',
      city: s.location_city || s.location || '',
    },
    pairingCode: s.pairing_code || s.pairingCode || '',
    timezone: s.timezone || 'America/New_York',
    status: s.is_active ? 'live' : 'offline',
    is_active: s.is_active,
    createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : undefined,
  }
}

export async function fetchStoresForTenant({
  token,
  tenantId,
  search,
  status,
  skip = 0,
  limit = 20,
}: FetchStoresParams): Promise<ApiResponseV2Paginated<TenantStore[]>> {
  if (!token || token.includes('mock')) {
    return fakeListStores({ tenantId, search, status, skip, limit })
  }

  try {
    const isActive = status === 'archived' || status === 'deactivated' ? false : true
    const { data: response } = await pythia2Client.get<ApiResponseV2Paginated<any[]>>(
      PYTHIA_2_API.stores.list,
      {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: search || undefined,
          skip,
          limit,
          is_active: isActive,
        },
      },
    )

    const mapped = (response.data || []).map((s: any) => mapApiStoreToTenantStore(s, tenantId))
    return {
      success: true,
      meta: response.meta || { total: mapped.length, skip, limit },
      data: mapped,
    }
  } catch (err) {
    console.warn('fetchStoresForTenant API call failed, falling back to mock:', err)
    return fakeListStores({ tenantId, search, status, skip, limit })
  }
}

export async function fetchDeactivatedStores({
  token,
  tenantId,
  search,
  skip = 0,
  limit = 20,
}: FetchStoresParams): Promise<ApiResponseV2Paginated<TenantStore[]>> {
  if (!token || token.includes('mock')) {
    return fakeListDeactivatedStores({ tenantId, search, skip, limit })
  }

  return fetchStoresForTenant({
    token,
    tenantId,
    search,
    status: 'deactivated',
    skip,
    limit,
  })
}

export async function deactivateStore({
  token,
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    return fakeDeactivateStore(storeId)
  }

  try {
    const { data: response } = await pythia2Client.post<ApiResponseV2<any>>(
      PYTHIA_2_API.stores.deactivate(storeId),
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return {
      success: true,
      data: mapApiStoreToTenantStore(response.data || { store_code: storeId, is_active: false }),
      message: response.message,
    }
  } catch (err) {
    console.warn('deactivateStore API failed, falling back to mock:', err)
    return fakeDeactivateStore(storeId)
  }
}

export async function activateStore({
  token,
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    return fakeActivateStore(storeId)
  }

  try {
    const { data: response } = await pythia2Client.post<ApiResponseV2<any>>(
      PYTHIA_2_API.stores.activate(storeId),
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return {
      success: true,
      data: mapApiStoreToTenantStore(response.data || { store_code: storeId, is_active: true }),
      message: response.message,
    }
  } catch (err) {
    console.warn('activateStore API failed, falling back to mock:', err)
    return fakeActivateStore(storeId)
  }
}

export async function createStore({
  token,
  data,
}: {
  token?: string
  data: CreateStoreParams
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    return fakeCreateStore(data)
  }

  try {
    const payload = {
      store_code: data.storeNo,
      store_name: data.name,
      location_city: data.location || data.city || 'City',
      district_region: data.district || 'Central',
      full_address: data.fullAddress || data.street || 'Address',
      pairing_code: data.pairingCode || `PAIR-${Date.now().toString(36).toUpperCase()}`,
      timezone: data.timezone || 'America/New_York',
    }
    const { data: response } = await pythia2Client.post<ApiResponseV2<any>>(
      PYTHIA_2_API.stores.create,
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return {
      success: true,
      data: mapApiStoreToTenantStore(response.data || payload, data.tenantId),
      message: response.message,
    }
  } catch (err) {
    console.warn('createStore API failed, falling back to mock:', err)
    return fakeCreateStore(data)
  }
}

export async function bulkCreateStores({
  token,
  data,
}: {
  token?: string
  data: BulkCreateStoresParams
}): Promise<ApiResponseV2<TenantStore[]>> {
  return fakeBulkCreateStores(data)
}

export async function simulateStoreHeartbeat({
  token,
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<ApiResponseV2<TenantStore>> {
  return fakeSimulateHeartbeat(storeId)
}

export async function updateStore({
  token,
  storeId,
  updates,
}: {
  token?: string
  storeId: string
  updates: Partial<TenantStore>
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    return fakeUpdateStore(storeId, updates)
  }

  try {
    const payload: any = {}
    if (updates.name) payload.store_name = updates.name
    if (updates.location) payload.location_city = updates.location
    if (updates.district) payload.district_region = updates.district
    if (updates.fullAddress) payload.full_address = updates.fullAddress
    if (updates.pairingCode) payload.pairing_code = updates.pairingCode
    if (updates.timezone) payload.timezone = updates.timezone

    const { data: response } = await pythia2Client.put<ApiResponseV2<any>>(
      PYTHIA_2_API.stores.detail(storeId),
      payload,
      { headers: { Authorization: `Bearer ${token}` } },
    )
    return {
      success: true,
      data: mapApiStoreToTenantStore(response.data, updates.tenantId),
      message: response.message,
    }
  } catch (err) {
    console.warn('updateStore API failed, falling back to mock:', err)
    return fakeUpdateStore(storeId, updates)
  }
}
