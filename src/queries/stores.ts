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
  StoreProvisionStatus,
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
  const isActive = s.is_active !== undefined ? Boolean(s.is_active) : s.status !== 'offline' && s.status !== 'closed'
  const computedStatus: StoreProvisionStatus = !isActive
    ? (s.status === 'closed' ? 'closed' : 'offline')
    : (s.status || 'live')

  return {
    _id: s.store_code || s._id || '',
    id: s.store_code || s.id || s._id || '',
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
    status: computedStatus,
    is_active: isActive,
    lastHeartbeat: s.last_heartbeat || s.lastHeartbeat || null,
    nodesOnline: s.nodes_online || s.nodesOnline || (isActive ? 2 : 0),
    managerCount: s.manager_count || s.managerCount,
    employeeCount: s.employee_count || s.employeeCount,
    createdAt: s.created_at ? new Date(s.created_at).toISOString() : new Date().toISOString(),
    updatedAt: s.updated_at ? new Date(s.updated_at).toISOString() : undefined,
    deactivated_at: s.deactivated_at ? new Date(s.deactivated_at).toISOString() : null,
    deactivated_by: s.deactivated_by ?? null,
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
        tenant_id: tenantId || undefined,
      },
    },
  )

  const mapped = (response.data || []).map((s: any) => mapApiStoreToTenantStore(s, tenantId))
  return {
    success: true,
    meta: response.meta || { total: mapped.length, skip, limit },
    data: mapped,
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

export async function fetchStore({
  token,
  storeCode,
}: {
  token?: string
  storeCode: string
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    const listRes = await fakeListStores({ search: storeCode, limit: 1 })
    const found = listRes.data.find((s) => s.id === storeCode || s.storeNo === storeCode)
    return {
      success: true,
      data: found || listRes.data[0],
    }
  }

  const { data: response } = await pythia2Client.get<ApiResponseV2<any>>(
    PYTHIA_2_API.stores.detail(storeCode),
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return {
    success: true,
    data: mapApiStoreToTenantStore(response.data),
    message: response.message,
  }
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

  const { data: response } = await pythia2Client.post<ApiResponseV2<any>>(
    PYTHIA_2_API.stores.deactivate(storeId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return {
    success: true,
    data: mapApiStoreToTenantStore(response.data || {
      store_code: storeId,
      is_active: false,
      deactivated_at: new Date().toISOString(),
    }),
    message: response.message,
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

  const { data: response } = await pythia2Client.post<ApiResponseV2<any>>(
    PYTHIA_2_API.stores.activate(storeId),
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  )
  return {
    success: true,
    data: mapApiStoreToTenantStore(response.data || {
      store_code: storeId,
      is_active: true,
    }),
    message: response.message,
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

  const payload: Record<string, any> = {
    store_code: (data.storeNo || '').trim(),
    store_name: (data.name || '').trim(),
    location_city: (data.location || data.city || '').trim(),
    district_region: (data.district || 'Central').trim(),
    full_address: (data.fullAddress || data.street || '').trim(),
    pairing_code: (data.pairingCode || `PAIR-${Date.now().toString(36).toUpperCase()}`).trim(),
    timezone: data.timezone || 'America/New_York',
  }
  if (data.tenantId) {
    payload.tenant_id = data.tenantId
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
  if (token && !token.includes('mock')) {
    return updateStore({
      token,
      storeId,
      updates: {
        status: 'live',
        lastHeartbeat: new Date().toISOString(),
        nodesOnline: 2,
      } as any,
    })
  }
  return fakeSimulateHeartbeat(storeId)
}

export async function updateStore({
  token,
  storeId,
  updates,
}: {
  token?: string
  storeId: string
  updates: Partial<TenantStore> & Record<string, any>
}): Promise<ApiResponseV2<TenantStore>> {
  if (!token || token.includes('mock')) {
    return fakeUpdateStore(storeId, updates)
  }

  const payload: any = {}
  if (updates.name !== undefined) payload.store_name = String(updates.name).trim()
  if (updates.store_name !== undefined) payload.store_name = String(updates.store_name).trim()
  if (updates.location !== undefined) payload.location_city = String(updates.location).trim()
  if (updates.location_city !== undefined) payload.location_city = String(updates.location_city).trim()
  if (updates.district !== undefined) payload.district_region = String(updates.district).trim()
  if (updates.district_region !== undefined) payload.district_region = String(updates.district_region).trim()
  if (updates.fullAddress !== undefined) payload.full_address = String(updates.fullAddress).trim()
  if (updates.full_address !== undefined) payload.full_address = String(updates.full_address).trim()
  if (updates.pairingCode !== undefined) payload.pairing_code = String(updates.pairingCode).trim()
  if (updates.pairing_code !== undefined) payload.pairing_code = String(updates.pairing_code).trim()
  if (updates.timezone !== undefined) payload.timezone = String(updates.timezone).trim()
  if (updates.status !== undefined) payload.status = updates.status
  if (updates.lastHeartbeat !== undefined) payload.last_heartbeat = updates.lastHeartbeat
  if (updates.last_heartbeat !== undefined) payload.last_heartbeat = updates.last_heartbeat
  if (updates.nodesOnline !== undefined) payload.nodes_online = updates.nodesOnline
  if (updates.nodes_online !== undefined) payload.nodes_online = updates.nodes_online

  const { data: response } = await pythia2Client.put<ApiResponseV2<any>>(
    PYTHIA_2_API.stores.detail(storeId),
    payload,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  const mapped = mapApiStoreToTenantStore(response.data || { ...payload, store_code: storeId }, updates.tenantId)
  if (updates.status !== undefined) {
    mapped.status = updates.status
  }
  return {
    success: true,
    data: mapped,
    message: response.message,
  }
}
