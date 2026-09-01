// Owner management query module for Super Admin and Multi-Tenant scope.
// Uses mock layer in `src/mock/tenantAPIs.ts` until backend endpoints are ready.
// Signature is ready for a drop-in swap with `pythia2Client`.

import {
  fakeListOwners,
  fakeListArchivedOwners,
  fakeCreateOwner,
  fakeGetOwnerCredentials,
  fakeArchiveOwner,
  fakeUnarchiveOwner,
} from '@/mock/tenantAPIs'
import type { ApiResponseV2Paginated } from '@/types/api'
import type {
  TenantOwner,
  CreateOwnerParams,
  CreateOwnerResponse,
  OwnerCredentials,
} from '@/types/owner'

export interface FetchOwnersParams {
  token?: string
  tenantId?: string
  search?: string
  status?: string
  skip?: number
  limit?: number
  signal?: AbortSignal
}

export async function fetchOwners({
  tenantId,
  search,
  status,
  skip = 0,
  limit = 15,
}: FetchOwnersParams): Promise<ApiResponseV2Paginated<TenantOwner[]>> {
  return fakeListOwners({ tenantId, search, status, skip, limit })
}

export async function fetchArchivedOwners({
  tenantId,
  search,
  skip = 0,
  limit = 15,
}: FetchOwnersParams): Promise<ApiResponseV2Paginated<TenantOwner[]>> {
  return fakeListArchivedOwners({ tenantId, search, skip, limit })
}

export async function createOwner(params: CreateOwnerParams): Promise<CreateOwnerResponse> {
  return fakeCreateOwner(params)
}

export async function fetchOwnerCredentials({
  userId,
}: {
  token?: string
  userId: string
}): Promise<OwnerCredentials> {
  return fakeGetOwnerCredentials(userId)
}

export async function archiveOwner({
  userId,
}: {
  token?: string
  userId: string
}): Promise<void> {
  return fakeArchiveOwner(userId)
}

export async function unarchiveOwner({
  userId,
}: {
  token?: string
  userId: string
}): Promise<void> {
  return fakeUnarchiveOwner(userId)
}

