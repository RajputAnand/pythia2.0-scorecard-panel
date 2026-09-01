// Manager Management queries. There is no /managers endpoint on the backend
// yet, so every function here is a passthrough to the mock layer in
// `src/mock/managerAPIs.ts` (same convention as `src/queries/overview.ts`).
// Signatures mirror `src/queries/employees.ts` so swapping in real
// `pythia2Client` calls later is a drop-in replacement.
import {
  fakeListManagers,
  fakeListArchivedManagers,
  fakeCreateManager,
  fakeGetManagerCredentials,
  fakeArchiveManager,
  fakeUnarchiveManager,
} from '@/mock/managerAPIs'
import type { CreateManagerParams, CreateManagerResponse, ManagerCredentials } from '@/types/manager'

export interface FetchManagersParams {
  token: string
  search?: string
  skip?: number
  limit?: number
}

export function fetchManagers({ search, skip = 0, limit = 15 }: FetchManagersParams) {
  return fakeListManagers({ search, skip, limit })
}

export function fetchArchivedManagers({ search, skip = 0, limit = 15 }: FetchManagersParams) {
  return fakeListArchivedManagers({ search, skip, limit })
}

export function createManager({
  firstName,
  lastName,
  email,
  phone,
  storeIds,
}: CreateManagerParams): Promise<CreateManagerResponse> {
  return fakeCreateManager({ firstName, lastName, email, phone, storeIds })
}

export function fetchManagerCredentials({ userId }: { token: string; userId: string }): Promise<ManagerCredentials> {
  return fakeGetManagerCredentials(userId)
}

export function archiveManager({ userId }: { token: string; userId: string }): Promise<void> {
  return fakeArchiveManager(userId)
}

export function unarchiveManager({ userId }: { token: string; userId: string }): Promise<void> {
  return fakeUnarchiveManager(userId)
}
