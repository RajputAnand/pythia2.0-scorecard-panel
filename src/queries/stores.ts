// Store management and provisioning query module.
// Uses mock layer in `src/mock/tenantAPIs.ts` until backend endpoints are ready.
// Signature is ready for a drop-in swap with `pythia2Client`.

import {
  fakeListStores,
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

export async function fetchStoresForTenant({
  tenantId,
  search,
  status,
  skip = 0,
  limit = 20,
}: FetchStoresParams): Promise<ApiResponseV2Paginated<TenantStore[]>> {
  return fakeListStores({ tenantId, search, status, skip, limit })
}

export async function createStore({
  data,
}: {
  token?: string
  data: CreateStoreParams
}): Promise<ApiResponseV2<TenantStore>> {
  return fakeCreateStore(data)
}

export async function bulkCreateStores({
  data,
}: {
  token?: string
  data: BulkCreateStoresParams
}): Promise<ApiResponseV2<TenantStore[]>> {
  return fakeBulkCreateStores(data)
}

export async function simulateStoreHeartbeat({
  storeId,
}: {
  token?: string
  storeId: string
}): Promise<ApiResponseV2<TenantStore>> {
  return fakeSimulateHeartbeat(storeId)
}

export async function updateStore({
  storeId,
  updates,
}: {
  token?: string
  storeId: string
  updates: Partial<TenantStore>
}): Promise<ApiResponseV2<TenantStore>> {
  return fakeUpdateStore(storeId, updates)
}

