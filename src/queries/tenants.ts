// Tenant management query module.
// Uses mock layer in `src/mock/tenantAPIs.ts` until backend endpoints are ready.
// Signature is ready for a drop-in swap with `pythia2Client`.

import {
  fakeListTenants,
  fakeGetTenant,
  fakeCreateTenant,
  fakeUpdateTenantStatus,
  fakeUpdateTenantChecklist,
} from '@/mock/tenantAPIs'
import type { ApiResponseV2, ApiResponseV2Paginated } from '@/types/api'
import type {
  Tenant,
  CreateTenantParams,
  TenantStatus,
  TenantChecklist,
} from '@/types/tenant'

export interface FetchTenantsParams {
  token?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
  signal?: AbortSignal
}

export async function fetchTenants({
  search,
  status,
  skip = 0,
  limit = 15,
}: FetchTenantsParams): Promise<ApiResponseV2Paginated<Tenant[]>> {
  return fakeListTenants({ search, status, skip, limit })
}

export async function fetchTenantDetail({
  tenantId,
}: {
  token?: string
  tenantId: string
  signal?: AbortSignal
}): Promise<ApiResponseV2<Tenant>> {
  return fakeGetTenant(tenantId)
}

export async function createTenant({
  data,
}: {
  token?: string
  data: CreateTenantParams
}): Promise<ApiResponseV2<Tenant>> {
  return fakeCreateTenant(data)
}

export async function updateTenantStatus({
  tenantId,
  status,
}: {
  token?: string
  tenantId: string
  status: TenantStatus
}): Promise<ApiResponseV2<Tenant>> {
  return fakeUpdateTenantStatus(tenantId, status)
}

export async function updateTenantChecklist({
  tenantId,
  checklist,
  step,
}: {
  token?: string
  tenantId: string
  checklist: Partial<TenantChecklist>
  step?: number
}): Promise<ApiResponseV2<Tenant>> {
  return fakeUpdateTenantChecklist(tenantId, checklist, step)
}

